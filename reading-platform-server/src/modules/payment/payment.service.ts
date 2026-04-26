import crypto from "node:crypto";
import Razorpay from "razorpay";
import { ENV } from "../../config/env.config.js";
import { prisma } from "../../config/db.config.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/api-error.js";
import { logger } from "../../config/logger.config.js";
import {
  PaymentProvider,
  PaymentStatus,
  PlanInterval,
  SubscriptionStatus,
} from "../../generated/prisma/enums.js";
import {
  type CreateSubscriptionInput,
  type VerifySubscriptionInput,
} from "./payment.schema.js";

const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

function addInterval(start: Date, interval: PlanInterval, intervalCount: number): Date {
  const end = new Date(start);
  if (interval === PlanInterval.MONTHLY) {
    end.setMonth(end.getMonth() + intervalCount);
  } else if (interval === PlanInterval.QUARTERLY) {
    end.setMonth(end.getMonth() + 3 * intervalCount);
  } else {
    end.setFullYear(end.getFullYear() + intervalCount);
  }
  return end;
}

function toPaise(amountInCurrency: number): number {
  return Math.round(amountInCurrency * 100);
}

export async function createSubscription(
  userId: number,
  input: CreateSubscriptionInput
) {
  const plan = await prisma.plan.findUnique({
    where: { id: input.planId },
  });

  if (!plan || !plan.isActive) {
    throw new NotFoundError("Active plan not found");
  }
  if (!plan.razorpayPlanId) {
    throw new BadRequestError(
      "Selected plan is missing razorpayPlanId mapping"
    );
  }
  if (!plan.razorpayPlanId.startsWith("plan_")) {
    throw new BadRequestError(
      "Invalid razorpayPlanId format on plan (expected value starting with plan_)"
    );
  }

  const amountPaise = toPaise(plan.price);
  if (amountPaise < 100) {
    throw new BadRequestError("Minimum amount is 100 paise");
  }

  try {
    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      total_count: input.totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId: String(userId),
        planId: String(plan.id),
      },
    });

    const now = new Date();
    const provisional = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.PAST_DUE,
          startDate: now,
          endDate: now,
          razorpaySubscriptionId: rzpSubscription.id,
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: plan.price,
          currency: plan.currency,
          provider: PaymentProvider.RAZORPAY,
          status: PaymentStatus.PENDING,
          failureReason: null,
        },
      });

      return { subscription, payment };
    });

    return {
      subscription_id: rzpSubscription.id,
      status: rzpSubscription.status,
      key_id: ENV.RAZORPAY_KEY_ID,
      payment_id: provisional.payment.id,
      plan: {
        id: plan.id,
        name: plan.name,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        amount_paise: amountPaise,
        currency: plan.currency,
      },
    };
  } catch (error: any) {
    const statusCode = error?.statusCode;
    const providerMessage =
      error?.error?.description || error?.error?.reason || error?.message;
    logger.error(
      {
        statusCode,
        providerMessage,
        razorpayError: error?.error,
      },
      "Failed to create Razorpay subscription"
    );
    if (error?.statusCode === 401) {
      throw new UnauthorizedError("Razorpay authentication failed");
    }
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      throw new BadRequestError(
        providerMessage || "Razorpay rejected subscription creation request"
      );
    }
    throw new Error(
      providerMessage || "Unable to create subscription checkout"
    );
  }
}

export async function verifySubscription(
  userId: number,
  input: VerifySubscriptionInput
) {
  const payload = `${input.razorpay_payment_id}|${input.razorpay_subscription_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(input.razorpay_signature, "utf8");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new BadRequestError("Invalid payment signature");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      provider: PaymentProvider.RAZORPAY,
      subscription: {
        razorpaySubscriptionId: input.razorpay_subscription_id,
      },
    },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError("Pending subscription payment not found");
  }

  if (!payment.subscription) {
    throw new BadRequestError("Payment is missing subscription context");
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return {
      verified: true,
      subscription_id: input.razorpay_subscription_id,
      payment_id: input.razorpay_payment_id,
      local_subscription_id: payment.subscription.id,
      status: payment.subscription.status,
    };
  }

  const now = new Date();
  const newEndDate = addInterval(
    now,
    payment.subscription.plan.interval,
    payment.subscription.plan.intervalCount
  );

  const result = await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        id: { not: payment.subscription!.id },
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
        endDate: now,
      },
    });

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        razorpayPaymentId: input.razorpay_payment_id,
        razorpaySignature: input.razorpay_signature,
        failureReason: null,
      },
    });

    const updatedSubscription = await tx.subscription.update({
      where: { id: payment.subscription!.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: newEndDate,
      },
    });

    return { updatedPayment, updatedSubscription };
  });

  return {
    verified: true,
    subscription_id: input.razorpay_subscription_id,
    payment_id: input.razorpay_payment_id,
    local_subscription_id: result.updatedSubscription.id,
    subscription_status: result.updatedSubscription.status,
    active_until: result.updatedSubscription.endDate,
  };
}
