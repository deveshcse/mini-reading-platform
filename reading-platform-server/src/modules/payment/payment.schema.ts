import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    amount: z
      .coerce.number()
      .int("Amount must be an integer in paise")
      .min(100, "Minimum amount is 100 paise"),
    currency: z.string().min(3).max(3).default("INR"),
    receipt: z.string().min(1).max(100).optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
    razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
    razorpay_signature: z.string().min(1, "razorpay_signature is required"),
  }),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>["body"];
