"use client";

import React from "react";
import Link from "next/link";
import type { Story } from "@/features/stories/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookMarked,
  BookOpen,
  Loader2,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryListProps {
  stories: Story[] | undefined;
  isLoading: boolean;
  error: unknown;
  className?: string;
  emptyMessage?: string;
}

export function StoryList({
  stories,
  isLoading,
  error,
  className,
  emptyMessage = "No stories in this list yet.",
}: StoryListProps) {
  if (isLoading) {
    return (
      <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-3", className)}>
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Loading</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center",
          className
        )}
      >
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-bold text-muted-foreground">Could not load stories. Try again later.</p>
      </div>
    );
  }

  if (!stories?.length) {
    return (
      <div
        className={cn(
          "flex min-h-[40vh] flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/30 p-12 text-center",
          className
        )}
      >
        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        <p className="max-w-sm text-sm font-bold uppercase tracking-tight text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {stories.map((story) => {
        const author = story.author;
        const isPremium = story.isPremium;
        const teaser = story.description?.trim() || null;

        return (
          <li key={story.id}>
            <Link href={`/stories/${story.id}`} className="block h-full group">
              <Card
                className={cn(
                  "h-full overflow-hidden rounded-none border-2 shadow-none transition-all group-focus-visible:ring-2 group-focus-visible:ring-ring",
                  isPremium
                    ? "border-amber-500/55 bg-gradient-to-b from-amber-500/[0.12] via-card to-card hover:-translate-y-0.5 hover:border-amber-500/90 hover:shadow-[0_0_0_1px] hover:shadow-amber-500/30"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/60"
                )}
              >
                {story.coverImage && (
                  <div
                    className={cn(
                      "relative aspect-[16/10] w-full overflow-hidden border-b-2 bg-muted",
                      isPremium ? "border-amber-500/30" : "border-border"
                    )}
                  >
                    <img
                      src={story.coverImage}
                      alt=""
                      className={cn("h-full w-full object-cover", isPremium && "scale-[1.01]")}
                    />
                    {isPremium && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-amber-500/5" />
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 border-t border-amber-500/20 bg-background/80 px-3 py-2 backdrop-blur-sm">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-200">
                            <Lock className="size-3.5 shrink-0" />
                            Subscriber story
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            Teaser
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!story.coverImage && isPremium && (
                  <div className="border-b-2 border-amber-500/30 bg-amber-500/10 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-200">
                      <Lock className="size-3.5" />
                      Premium — preview on detail page
                    </span>
                  </div>
                )}

                <CardHeader
                  className={cn("space-y-2 pb-2", isPremium && "bg-gradient-to-b from-transparent to-amber-500/[0.04]")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {!story.isPublished && (
                      <Badge
                        variant="secondary"
                        className="rounded-none text-[9px] font-black uppercase"
                      >
                        Draft
                      </Badge>
                    )}
                    {isPremium && (
                      <Badge
                        className="rounded-none border-2 border-amber-600/40 bg-amber-500/20 text-amber-950 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-100"
                      >
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase">
                          <BookMarked className="size-3" />
                          Paid
                        </span>
                      </Badge>
                    )}
                  </div>
                  <CardTitle
                    className={cn(
                      "line-clamp-2 text-base font-black uppercase leading-tight tracking-tight",
                      isPremium
                        ? "text-amber-950 group-hover:text-amber-800 dark:group-hover:text-amber-200 dark:text-amber-100"
                        : "group-hover:text-primary"
                    )}
                  >
                    {story.title}
                  </CardTitle>
                  {author && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {author.firstName} {author.lastName}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-2 pt-0">
                  {isPremium && (
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700/90 dark:text-amber-300/90">
                      Public teaser
                    </p>
                  )}
                  {teaser ? (
                    <CardDescription
                      className={cn(
                        "line-clamp-3 text-xs font-medium leading-relaxed",
                        isPremium && "text-foreground/90"
                      )}
                    >
                      {teaser}
                    </CardDescription>
                  ) : isPremium ? (
                    <CardDescription className="line-clamp-3 text-xs italic text-muted-foreground">
                      This story is for subscribers. Open it to read a free preview, then unlock the
                      full work with an active plan.
                    </CardDescription>
                  ) : null}
                  {isPremium && (
                    <p className="pt-1 text-[10px] font-bold leading-snug text-amber-800/80 dark:text-amber-200/80">
                      Open the story page for a short free preview, then subscribe for the full work.
                    </p>
                  )}
                  {isPremium && (
                    <p className="pt-2 flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-amber-700 group-hover:text-amber-600 dark:text-amber-300">
                      Read preview
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
