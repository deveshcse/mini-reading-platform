import { z } from "zod";

export const createStorySchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().max(1000).optional(),
    content: z.string().min(1, "Content is required"),
    coverImage: z.string().url("Invalid cover image URL").optional(),
    isPublished: z.boolean().default(false),
    isPremium: z.boolean().default(false),
  }),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>["body"];

export const updateStorySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    content: z.string().min(1).optional(),
    coverImage: z.string().url().optional(),
    isPublished: z.boolean().optional(),
    isPremium: z.boolean().optional(),
  }),
});

export type UpdateStoryInput = z.infer<typeof updateStorySchema>["body"];

export const storyQuerySchema = z.object({
  query: z.object({
    page: z.string().default("1").transform(Number),
    pageSize: z.string().default("10").transform(Number),


    authorId: z.string().transform(Number).optional(),
    isPublished: z.string().transform((val) => val === "true").optional(),
    isPremium: z.string().transform((val) => val === "true").optional(),
  }),
});

export type StoryQueryInput = z.infer<typeof storyQuerySchema>["query"];
