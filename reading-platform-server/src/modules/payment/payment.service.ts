import crypto from "node:crypto";
import Razorpay from "razorpay";
import { ENV } from "../../config/env.config.js";
import { BadRequestError, UnauthorizedError } from "../../utils/api-error.js";
import { logger } from "../../config/logger.config.js";
import {
  type CreateOrderInput,
  type VerifyPaymentInput,
} from "./payment.schema.js";

const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

export async function createOrder(input: CreateOrderInput) {
  if (input.amount < 100) {
    throw new BadRequestError("Minimum amount is 100 paise");
  }

  try {
    const order = await razorpay.orders.create({
      amount: input.amount,
      currency: input.currency ?? "INR",
      receipt:
        input.receipt ?? `receipt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    });

    return {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: ENV.RAZORPAY_KEY_ID,
    };
  } catch (error: any) {
    logger.error(error, "Failed to create Razorpay order");
    if (error?.statusCode === 401) {
      throw new UnauthorizedError("Razorpay authentication failed");
    }
    throw new Error("Unable to create payment order");
  }
}

export async function verifyPayment(input: VerifyPaymentInput) {
  const payload = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
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

  return {
    verified: true,
    order_id: input.razorpay_order_id,
    payment_id: input.razorpay_payment_id,
  };
}
