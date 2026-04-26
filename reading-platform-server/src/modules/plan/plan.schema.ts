import { z } from "zod";
import { PlanInterval, SubscriptionPlanName } from "../../generated/prisma/enums.js";

const positivePrice = z.number().positive("Price must be greater than 0");

export const createPlanSchema = z.object({
  body: z.object({
    name: z.nativeEnum(SubscriptionPlanName),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().pipe(positivePrice),
    currency: z.string().min(3).max(10).default("INR"),
    interval: z.nativeEnum(PlanInterval),
    intervalCount: z.coerce.number().int().min(1).default(1),
    isActive: z.boolean().default(true),
    razorpayPlanId: z.string().min(1).max(100).optional(),
  }),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>["body"];

export const updatePlanSchema = z.object({
  body: z
    .object({
      description: z.string().max(2000).optional(),
      price: z.coerce.number().pipe(positivePrice).optional(),
      currency: z.string().min(3).max(10).optional(),
      interval: z.nativeEnum(PlanInterval).optional(),
      intervalCount: z.coerce.number().int().min(1).optional(),
      isActive: z.boolean().optional(),
      razorpayPlanId: z.string().min(1).max(100).nullable().optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one field is required for update",
    }),
});

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>["body"];

export const planIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type PlanIdParams = z.infer<typeof planIdParamsSchema>["params"];

export const listPlansQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    isActive: z
      .string()
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
  }),
});

export type ListPlansQueryInput = z.infer<typeof listPlansQuerySchema>["query"];
