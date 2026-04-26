import { z } from "zod";
import { PlanInterval, SubscriptionPlanName } from "@/features/plans/types";

export const createPlanSchema = z.object({
  name: z.enum([
    SubscriptionPlanName.STANDARD,
    SubscriptionPlanName.PREMIUM,
    SubscriptionPlanName.ENTERPRISE,
  ]),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.string().min(3).max(10).default("INR"),
  interval: z.enum([PlanInterval.MONTHLY, PlanInterval.QUARTERLY, PlanInterval.YEARLY]),
  intervalCount: z.coerce.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  razorpayPlanId: z.string().max(100).optional(),
});

export const updatePlanSchema = z
  .object({
    description: z.string().max(2000).optional(),
    price: z.coerce.number().positive("Price must be greater than 0").optional(),
    currency: z.string().min(3).max(10).optional(),
    interval: z
      .enum([PlanInterval.MONTHLY, PlanInterval.QUARTERLY, PlanInterval.YEARLY])
      .optional(),
    intervalCount: z.coerce.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
    razorpayPlanId: z.string().max(100).nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required for update",
  });

export const listPlansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  isActive: z.boolean().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type ListPlansQueryInput = z.input<typeof listPlansQuerySchema>;
