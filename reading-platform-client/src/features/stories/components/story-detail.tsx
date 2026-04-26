"use client";

import React from "react";
import Link from "next/link";
import type { StoryWithAccess } from "@/features/stories/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/shared/components/can";
import { PremiumReadGate } from "@/features/stories/components/premium-read-gate";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import {
  useStoryLikeCount,
  useStoryLikeStatus,
  useToggleStoryLike,
} from "@/features/stories/hooks/use-story-likes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookMarked, CheckCircle2, Eye, Heart, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryDetailProps {
  story: StoryWithAccess;
  className?: string;
}

/**
 * Strip HTML tags and collapse whitespace to get readable plain text.
 * Used to render a clean teaser when the backend returns truncated HTML
 * that may be cut mid-tag (e.g. "<p>Hello wor" → "Hello wor").
 */
function StoryDetailLikeBar({ storyId }: { storyId: number }) {
  const { isAuthenticated } = useAuthContext();
  const { data: likesPayload, isLoading: countLoading } = useStoryLikeCount(storyId);
  const { data: statusPayload, isFetching: statusFetching } = useStoryLikeStatus(storyId);
  const toggle = useToggleStoryLike(storyId);

  const total = likesPayload?.meta.total;
  const liked = statusPayload?.liked ?? false;
  const countLabel =
    countLoading && total === undefined
      ? "…"
      : (total ?? 0).toLocaleString();

  const statusLoading =
    isAuthenticated && statusFetching && statusPayload === undefined;
  const disabled =
    !isAuthenticated || toggle.isPending || statusLoading;

  return (
    <>
      <span className="text-border" aria-hidden>
        |
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 shrink-0 rounded-none border-2 border-transparent hover:border-primary/30",
                liked && "text-destructive hover:text-destructive"
              )}
              disabled={disabled}
              aria-pressed={liked}
              aria-label={liked ? "Unlike story" : "Like story"}
              onClick={() => {
                if (isAuthenticated) toggle.mutate();
              }}
            >
              <Heart
                className={cn(
                  "size-4",
                  liked && "fill-current"
                )}
                aria-hidden
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isAuthenticated
              ? liked
                ? "Unlike"
                : "Like"
              : "Sign in to like"}
          </TooltipContent>
        </Tooltip>
        <span className="tabular-nums">
          {countLabel}{" "}
          <span className="text-muted-foreground">likes</span>
        </span>
      </span>
    </>
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function StoryDetail({ story, className }: StoryDetailProps) {
  const author = story.author;
  const byline = author
    ? `${author.firstName} ${author.lastName}`
    : `Author #${story.authorId}`;

  const isPaywalled = story.isPremium && story.isLocked;
  const hasFullPremiumAccess = story.isPremium && !story.isLocked;

  return (
    <article
      className={cn("w-full min-w-0 space-y-8 contain-[inline-size]", className)}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="space-y-4 border-b-4 border-primary/20 pb-6 sm:space-y-5 sm:pb-8">

        {/* Badges — only what matters, not all at once */}
        <div className="flex flex-wrap items-center gap-2">
          {!story.isPublished && (
            <Badge variant="outline" className="rounded-none text-[10px] font-black uppercase">
              Draft
            </Badge>
          )}
          {story.isPremium && (
            <Badge
              className={cn(
                "rounded-none text-[10px] font-black uppercase gap-1.5 h-6 border-2",
                hasFullPremiumAccess
                  ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
              )}
            >
              {hasFullPremiumAccess ? (
                <CheckCircle2 className="size-3" aria-hidden />
              ) : (
                <BookMarked className="size-3" aria-hidden />
              )}
              {hasFullPremiumAccess ? "Full access" : "Premium"}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-black uppercase leading-none tracking-tighter italic sm:text-4xl md:text-5xl">
          {story.title}
        </h1>

        {/* Byline + views */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:text-xs md:text-sm">
          <span>{byline}</span>
          <span className="text-border" aria-hidden>|</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" aria-hidden />
            {story.viewCount.toLocaleString()} views
          </span>
          <StoryDetailLikeBar storyId={story.id} />
        </p>

        {story.description && (
          <p className="border-l-4 border-primary/30 pl-3 text-sm font-medium leading-relaxed text-muted-foreground sm:pl-4 sm:text-base">
            {story.description}
          </p>
        )}

        <Can resource="story" action="update">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-none border-2 font-black uppercase text-xs"
          >
            <Link href={`/stories/edit/${story.id}`} className="gap-2 inline-flex items-center">
              <Pencil className="size-3.5" aria-hidden />
              Edit story
            </Link>
          </Button>
        </Can>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <section aria-label="Story body" className="min-w-0 max-w-full overflow-x-hidden">
        <h2 className="sr-only">Story text</h2>

        <div className="mx-auto w-full min-w-0 max-w-prose">
          {isPaywalled ? (
            /**
             * Paywalled: strip the truncated HTML to plain text so mid-tag cuts
             * don't produce broken markup or half-rendered elements. Apply a
             * bottom fade to signal more content exists.
             */
            <div className="relative">
              <p
                className= "text-base font-medium leading-relaxed text-foreground/80 line-clamp-8"
              >
                {stripHtml(story.content)}
              </p>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"
                aria-hidden
              />
            </div>
          ) : (
            /**
             * Full access: render the rich HTML as-is.
             */
            <div
              className={cn(
                "story-html prose prose-slate w-full min-w-0 max-w-none dark:prose-invert",
                "prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight",
                "prose-p:font-medium wrap-anywhere",
                "prose-img:max-w-full prose-img:h-auto",
                "prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap",
                "prose-code:wrap-break-word"
              )}
              data-story-content
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          )}
        </div>
      </section>

      {/* ── Paywall gate ──────────────────────────────────────────────────── */}
      {isPaywalled && <PremiumReadGate />}

      {/* ── Full-access confirmation ───────────────────────────────────────── */}
      {hasFullPremiumAccess && (
        <p className="flex items-center justify-center gap-2 border-2 border-emerald-500/20 bg-emerald-500/5 py-3 text-center text-xs font-bold uppercase tracking-widest text-emerald-800/90 dark:text-emerald-200/90">
          <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
          You&apos;re reading the full premium edition.
        </p>
      )}
    </article>
  );
}