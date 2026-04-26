import { z } from "zod";

export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.coerce.number().int().positive("planId is required"),
    totalCount: z.coerce.number().int().min(1).max(120).default(12),
  }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>["body"];

export const verifySubscriptionSchema = z.object({
  body: z.object({
    razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
    razorpay_subscription_id: z
      .string()
      .min(1, "razorpay_subscription_id is required"),
    razorpay_signature: z.string().min(1, "razorpay_signature is required"),
  }),
});

export type VerifySubscriptionInput = z.infer<typeof verifySubscriptionSchema>["body"];
