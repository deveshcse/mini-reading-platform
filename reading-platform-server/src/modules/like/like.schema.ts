import { z } from "zod";

export const likeParamsSchema = z.object({
  params: z.object({
    storyId: z.string().transform(Number),
  }),
});

export const likeQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

export type LikeQueryInput = z.infer<typeof likeQuerySchema>["query"];

export const likeListSchema = z.object({
  params: likeParamsSchema.shape.params,
  query: likeQuerySchema.shape.query,
});
