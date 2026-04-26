"use client"

import React, { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Globe, Loader2, Save, Send, Star } from "lucide-react"
import {
  createStorySchema,
  type CreateStoryInput,
  type CreateStoryFormValues,
} from "@/features/stories/schema"
import type { Story } from "@/features/stories/types"
import { StoryRichTextEditor } from "@/features/stories/components/story-rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultValues: CreateStoryFormValues = {
  title: "",
  description: "",
  content: "<p></p>",
  isPublished: false,
  isPremium: false,
}

const textareaClass = cn(
  "flex w-full min-w-0 rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  "min-h-[88px] resize-y disabled:pointer-events-none disabled:opacity-50"
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storyToFormValues(s: Story): CreateStoryFormValues {
  return {
    title: s.title,
    description: s.description?.trim() ?? "",
    content: s.content?.length > 0 ? s.content : "<p></p>",
    isPublished: s.isPublished,
    isPremium: s.isPremium,
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StoryFormProps {
  initialData?: Story
  isLoading?: boolean
  onSubmit: (data: CreateStoryInput) => void
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StoryForm({
  initialData,
  isLoading = false,
  onSubmit,
  className,
}: StoryFormProps) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateStoryFormValues, unknown, CreateStoryInput>({
    resolver: zodResolver(createStorySchema),
    defaultValues: initialData ? storyToFormValues(initialData) : defaultValues,
  })

  useEffect(() => {
    if (initialData) reset(storyToFormValues(initialData))
  }, [initialData, reset])

  const editorKey = isEdit ? `rte-${initialData.id}` : "rte-new"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("relative", className)}
      noValidate
    >
      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex flex-col gap-3 border-b-2 border-input bg-background/95 px-3 py-2 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
        {/* Left: status flags */}
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-5">
          {/* Published toggle */}
          <Controller
            name="isPublished"
            control={control}
            render={({ field: { value, onChange, onBlur, name, ref } }) => (
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <Checkbox
                  ref={ref}
                  name={name}
                  checked={value}
                  onCheckedChange={(c) => onChange(c === true)}
                  onBlur={onBlur}
                  disabled={isLoading}
                  id="story-published"
                />

                {/* Icon */}
                <Globe
                  className={`h-3.5 w-3.5 ${
                    value ? "text-green-600" : "text-gray-400"
                  }`}
                />

                {/* Text */}
                <span className="text-xs font-bold tracking-widest uppercase">
                  Published
                </span>
              </label>
            )}
          />

          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />

          {/* Premium toggle */}
          <Controller
            name="isPremium"
            control={control}
            render={({ field: { value, onChange, onBlur, name, ref } }) => (
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <Checkbox
                  ref={ref}
                  name={name}
                  checked={value}
                  onCheckedChange={(c) => onChange(c === true)}
                  onBlur={onBlur}
                  disabled={isLoading}
                  id="story-premium"
                />
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      value ? "text-amber-500" : "text-muted-foreground"
                    )}
                  />
                  Premium
                </span>
              </label>
            )}
          />
        </div>

        {/* Right: submit button */}
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          className="h-9 w-full shrink-0 gap-2 rounded-none border-2 px-4 font-black tracking-widest uppercase sm:w-auto sm:px-5"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isEdit ? (
            <Save className="h-3.5 w-3.5" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {isEdit ? "Save changes" : "Publish"}
        </Button>
      </div>

      {/* ── Form body ────────────────────────────────────────────────────── */}
      <FieldGroup className="w-full min-w-0 space-y-6 pt-4 sm:pt-6">
        {/* Title */}
        <Field>
          <FieldLabel
            htmlFor="story-title"
            className="text-xs font-black tracking-widest uppercase"
          >
            Title
          </FieldLabel>
          <Input
            id="story-title"
            placeholder="A compelling title"
            className="rounded-none border-2 text-base font-bold"
            disabled={isLoading}
            aria-invalid={!!errors.title}
            maxLength={100}
            {...register("title")}
          />
          <FieldError>{errors.title?.message}</FieldError>
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel
            htmlFor="story-description"
            className="text-xs font-black tracking-widest uppercase"
          >
            Description{" "}
            <span className="font-normal tracking-normal text-muted-foreground normal-case">
              (optional)
            </span>
          </FieldLabel>
          <textarea
            id="story-description"
            rows={3}
            placeholder="Short blurb shown in listings and search results"
            className={textareaClass}
            disabled={isLoading}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        {/* Content */}
        <Field>
          <FieldLabel
            htmlFor="story-content"
            className="text-xs font-black tracking-widest uppercase"
          >
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
      </FieldGroup>
    </form>
  )
}
