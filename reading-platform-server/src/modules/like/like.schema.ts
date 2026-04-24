import { z } from "zod";

export const likeParamsSchema = z.object({
  params: z.object({
    storyId: z.string().transform(Number),
  }),
});

export const likeQuerySchema = z.object({
  query: z.object({
    page: z.string().default("1").transform(Number),
    pageSize: z.string().default("10").transform(Number),
  }),
});

export type LikeQueryInput = z.infer<typeof likeQuerySchema>["query"];
