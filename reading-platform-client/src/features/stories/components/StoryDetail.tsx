"use client";

import React from "react";
import Link from "next/link";
import type { StoryWithAccess } from "@/features/stories/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/shared/components/can";
import { PremiumReadGate } from "@/features/stories/components/PremiumReadGate";
import { BookMarked, CheckCircle2, Eye, Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryDetailProps {
  story: StoryWithAccess;
  className?: string;
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
      

      <header className="space-y-4 border-b-4 border-primary/30 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {story.isPremium && (
            <Badge
              className={cn(
                "rounded-none text-[10px] font-black uppercase gap-1.5 h-7",
                hasFullPremiumAccess &&
                  "border-2 border-emerald-600/40 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100"
              )}
            >
              <BookMarked className="size-3.5" />
              Premium
            </Badge>
          )}
          {isPaywalled && (
            <Badge
              variant="secondary"
              className="rounded-none border-2 border-amber-500/40 text-[10px] font-black uppercase gap-1 text-amber-900 dark:text-amber-100"
            >
              <Lock className="size-3" />
              Preview excerpt
            </Badge>
          )}
          {hasFullPremiumAccess && (
            <Badge className="rounded-none border-2 border-emerald-600/30 bg-emerald-500/10 text-[10px] font-black uppercase gap-1 text-emerald-900 dark:text-emerald-100">
              <CheckCircle2 className="size-3" />
              Full access
            </Badge>
          )}
          {!story.isPublished && (
            <Badge variant="outline" className="rounded-none text-[10px] font-black uppercase">
              Unpublished
            </Badge>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none italic">
          {story.title}
        </h1>

        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {byline}
          <span className="mx-2 text-border">|</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" />
            {story.viewCount} views
          </span>
        </p>

        {story.description && (
          <p className="text-lg text-muted-foreground font-medium leading-relaxed not-italic border-l-4 border-primary/30 pl-4">
            {story.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Can resource="story" action="update">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-none border-2 font-black uppercase text-xs"
            >
              <Link href={`/stories/edit/${story.id}`} className="gap-2">
                <Pencil className="size-3.5" />
                Edit
              </Link>
            </Button>
          </Can>
        </div>
      </header>

      {isPaywalled && (
        <p className="text-sm font-bold uppercase tracking-widest text-amber-800 dark:text-amber-200 border-2 border-amber-500/25 bg-amber-500/10 px-4 py-3">
          The body below is truncated for non-subscribers (server sends the first ~200 characters of
          HTML). Subscribe to load the full piece.
        </p>
      )}

      <section aria-label="Story body" className="min-w-0 max-w-full overflow-x-hidden">
        <h2 className="sr-only">Story text</h2>
        <div className="relative min-w-0 max-w-full">
          <div
            className={cn(
              "story-html prose prose-slate w-full min-w-0 max-w-none dark:prose-invert",
              "prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium",
              "wrap-anywhere",
              "prose-img:max-w-full prose-img:h-auto",
              "prose-video:max-w-full",
              "prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap",
              "prose-code:wrap-break-word",
              isPaywalled && "pb-2"
            )}
            data-locked={isPaywalled ? "true" : undefined}
            data-story-content
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
          {isPaywalled && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent"
              aria-hidden
            />
          )}
        </div>
      </section>

      {isPaywalled && <PremiumReadGate storyId={story.id} />}

      {hasFullPremiumAccess && (
        <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-800/90 dark:text-emerald-200/90 border-2 border-emerald-500/20 bg-emerald-500/5 py-3">
          <CheckCircle2 className="mb-0.5 inline size-4 align-middle text-emerald-600" />
          <span className="ml-2">You&apos;re reading the full premium edition.</span>
        </p>
      )}
    </article>
  );
}
