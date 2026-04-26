"use client";

import React from "react";
import Link from "next/link";
import type { StoryWithAccess } from "@/features/stories/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/shared/components/can";
import { PremiumReadGate } from "@/features/stories/components/PremiumReadGate";
import { BookMarked, CheckCircle2, Eye, Pencil } from "lucide-react";
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
      className={cn(
        "mx-auto w-full min-w-0 max-w-3xl space-y-8 contain-[inline-size]",
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="space-y-5 border-b-4 border-primary/20 pb-8">

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

        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none italic">
          {story.title}
        </h1>

        {/* Byline + views */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <span>{byline}</span>
          <span className="text-border" aria-hidden>|</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" aria-hidden />
            {story.viewCount.toLocaleString()} views
          </span>
        </p>

        {story.description && (
          <p className="border-l-4 border-primary/30 pl-4 text-base text-muted-foreground font-medium leading-relaxed">
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

        {isPaywalled ? (
          /**
           * Paywalled: strip the truncated HTML to plain text so mid-tag cuts
           * don't produce broken markup or half-rendered elements. Apply a
           * bottom fade to signal more content exists.
           */
          <div className="relative">
            <p
              className={cn(
                "text-base font-medium leading-relaxed text-foreground/80",
                "line-clamp-[8]"
              )}
            >
              {stripHtml(story.content)}
            </p>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
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
      </section>

      {/* ── Paywall gate ──────────────────────────────────────────────────── */}
      {isPaywalled && <PremiumReadGate storyId={story.id} />}

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