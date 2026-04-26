import { z } from "zod";

/** Match server `optionalUrlOrPath` in `story.schema.ts` */
const optionalCover = z
  .string()
  .max(2000)
  .optional()
  .transform((s) => (s == null || s === "" ? undefined : s))
  .refine(
    (s) => s === undefined || /^https?:\/\//.test(s) || s.startsWith("/"),
    "Cover image must be a full URL or a path starting with /"
  );

function hasVisibleText(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

function normalizeDescription(s: string): string | undefined {
  const trimmed = s.trim();
  return trimmed === "" ? undefined : trimmed;
}

const storyContentField = z
  .string()
  .refine((html) => hasVisibleText(html), "Content is required");

export const createStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z
    .string()
    .refine(
      (s) => {
        const value = normalizeDescription(s);
        return value === undefined || value.length >= 150;
      },
      "Description must be at least 150 characters"
    )
    .max(1000)
    .transform(normalizeDescription),
  content: storyContentField,
  coverImage: optionalCover,
  isPublished: z.boolean().default(false),
  isPremium: z.boolean().default(false),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type CreateStoryFormValues = z.input<typeof createStorySchema>;

/** Partial for PATCH; still validate `content` when present (non-empty HTML). */
export const updateStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z
    .string()
    .max(1000)
    .optional()
    .refine(
      (s) => {
        if (s === undefined) return true;
        const value = normalizeDescription(s);
        return value === undefined || value.length >= 150;
      },
      "Description must be at least 150 characters"
    )
    .transform((s) => (s === undefined ? undefined : normalizeDescription(s))),
  content: z
    .string()
    .optional()
    .refine(
      (html) => html === undefined || hasVisibleText(html),
      "Content cannot be empty"
    ),
  coverImage: optionalCover,
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
});

export type UpdateStoryInput = z.infer<typeof updateStorySchema>;

/** For API query string validation (e.g. if used with zod on client). */
export const storyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  authorId: z.coerce.number().int().positive().optional(),
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
});

/** Params passed to `useStories` — all optional; server applies defaults. */
export type StoryQueryInput = z.input<typeof storyQuerySchema>;
