"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Send } from "lucide-react";
import {
  createStorySchema,
  type CreateStoryInput,
  type CreateStoryFormValues,
} from "@/features/stories/schema";
import type { Story } from "@/features/stories/types";
import { StoryRichTextEditor } from "@/features/stories/components/story-rich-text-editor/StoryRichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultValues: CreateStoryFormValues = {
  title: "",
  description: "",
  content: "<p></p>",
  coverImage: "",
  isPublished: false,
  isPremium: false,
};

const textareaClass = cn(
  "flex w-full min-w-0 rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50 resize-y min-h-[88px]",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20"
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storyToFormValues(s: Story): CreateStoryFormValues {
  return {
    title: s.title,
    description: s.description?.trim() ?? "",
    content: s.content?.length > 0 ? s.content : "<p></p>",
    coverImage: s.coverImage ?? "",
    isPublished: s.isPublished,
    isPremium: s.isPremium,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StoryFormProps {
  initialData?: Story;
  isLoading?: boolean;
  onSubmit: (data: CreateStoryInput) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StoryForm({ initialData, isLoading = false, onSubmit, className }: StoryFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateStoryFormValues, unknown, CreateStoryInput>({
    resolver: zodResolver(createStorySchema),
    defaultValues: initialData ? storyToFormValues(initialData) : defaultValues,
  });

  // Sync form when initialData loads asynchronously (e.g. after a fetch).
  useEffect(() => {
    if (initialData) reset(storyToFormValues(initialData));
  }, [initialData, reset]);

  // Remount the editor when the story record changes so Tiptap picks up the new content.
  const editorKey = isEdit ? `rte-${initialData.id}` : "rte-new";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-8", className)} noValidate>
      <FieldGroup className="space-y-6 max-w-3xl">

        {/* Title */}
        <Field>
          <FieldLabel htmlFor="story-title" className="text-xs font-black uppercase tracking-widest">
            Title
          </FieldLabel>
          <Input
            id="story-title"
            placeholder="A compelling title"
            className="rounded-none border-2 text-base font-bold"
            disabled={isLoading}
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError>{errors.title?.message}</FieldError>
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="story-description" className="text-xs font-black uppercase tracking-widest">
            Description <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <textarea
            id="story-description"
            rows={3}
            placeholder="Short blurb for lists and search"
            className={textareaClass}
            disabled={isLoading}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        {/* Content */}
        <Field>
          <FieldLabel htmlFor="story-content" className="text-xs font-black uppercase tracking-widest">
            Content
          </FieldLabel>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <StoryRichTextEditor
                key={editorKey}
                id="story-content"
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                placeholder="Write the body of your story…"
                aria-invalid={!!errors.content}
              />
            )}
          />
          <FieldError>{errors.content?.message}</FieldError>
        </Field>

        {/* Cover image */}
        <Field>
          <FieldLabel htmlFor="story-cover" className="text-xs font-black uppercase tracking-widest">
            Cover image URL <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input
            id="story-cover"
            type="url"
            placeholder="https://… or /static/covers/…"
            className="rounded-none border-2"
            disabled={isLoading}
            aria-invalid={!!errors.coverImage}
            {...register("coverImage")}
          />
          <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
            Use a full https URL or a path starting with /
          </p>
          <FieldError>{errors.coverImage?.message as string | undefined}</FieldError>
        </Field>

        {/* Flags */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center border-2 border-dashed border-muted-foreground/25 p-4">
          <Field orientation="horizontal" className="items-center gap-3">
            <Controller
              name="isPublished"
              control={control}
              render={({ field: { value, onChange, onBlur, name, ref } }) => (
                <Checkbox
                  id="story-published"
                  ref={ref}
                  name={name}
                  checked={value}
                  onCheckedChange={(c) => onChange(c === true)}
                  onBlur={onBlur}
                  disabled={isLoading}
                />
              )}
            />
            <FieldLabel htmlFor="story-published" className="text-xs font-bold uppercase tracking-widest">
              Published
            </FieldLabel>
          </Field>

          <Field orientation="horizontal" className="items-center gap-3">
            <Controller
              name="isPremium"
              control={control}
              render={({ field: { value, onChange, onBlur, name, ref } }) => (
                <Checkbox
                  id="story-premium"
                  ref={ref}
                  name={name}
                  checked={value}
                  onCheckedChange={(c) => onChange(c === true)}
                  onBlur={onBlur}
                  disabled={isLoading}
                />
              )}
            />
            <FieldLabel htmlFor="story-premium" className="text-xs font-bold uppercase tracking-widest">
              Premium (requires subscription to read in full)
            </FieldLabel>
          </Field>
        </div>

      </FieldGroup>

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t-4 border-primary/20">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="rounded-none h-12 px-8 font-black uppercase tracking-widest gap-2 border-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEdit ? (
            <Save className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isEdit ? "Save changes" : "Publish to archive"}
        </Button>
      </div>
    </form>
  );
}