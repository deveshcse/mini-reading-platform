import { z } from "zod";

const optionalUrlOrPath = z
  .string()
  .max(2000)
  .optional()
  .transform((s) => (s == null || s === "" ? undefined : s))
  .refine(
    (s) => s === undefined || /^https?:\/\//.test(s) || s.startsWith("/"),
    "Cover image must be a full URL or a path starting with /"
  );

export const createStorySchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().max(1000).optional(),
    content: z.string().min(1, "Content is required"),
    coverImage: optionalUrlOrPath.optional(),
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
    coverImage: optionalUrlOrPath.optional(),
    isPublished: z.boolean().optional(),
    isPremium: z.boolean().optional(),
  }),
});

export type UpdateStoryInput = z.infer<typeof updateStorySchema>["body"];

const queryFlag = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === "true") return true;
    if (v === "false") return false;
    return undefined;
  });

const optionalPositiveId = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().positive().optional()
);

/** Query: omit `isPublished` for the default feed. `isPublished=true` = published only. `isPublished=false` = your unpublished drafts (authors only; READERs use the default feed if sent). */
export const storyQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    authorId: optionalPositiveId,
    isPublished: queryFlag,
    isPremium: queryFlag,
  }),
});

export type StoryQueryInput = z.infer<typeof storyQuerySchema>["query"];
