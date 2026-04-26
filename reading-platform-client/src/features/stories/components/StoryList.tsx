"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { BookMarked, BookOpen, Loader2, AlertCircle, Lock, ArrowRight } from "lucide-react";
import { Story } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Loading
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center", className)}>
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-bold text-muted-foreground">
          Could not load stories. Try again later.
        </p>
      </div>
    );
  }

  if (!stories?.length) {
    return (
      <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25 p-12 text-center", className)}>
        <BookOpen className="h-10 w-10 text-muted-foreground/40" />
        <p className="max-w-xs text-sm font-bold uppercase tracking-tight text-muted-foreground">
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
              <article
                className={cn(
                  "flex h-full flex-col overflow-hidden border-2 transition-colors",
                  isPremium
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {/* Cover image */}
                {story.coverImage && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-inherit bg-muted">
                    <Image
                      src={story.coverImage}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-3 p-4">

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {!story.isPublished && (
                      <Badge
                        variant="secondary"
                        className="rounded-none text-[9px] font-black uppercase h-5"
                      >
                        Draft
                      </Badge>
                    )}
                    {isPremium && (
                      <Badge className="rounded-none border-2 border-amber-600/40 bg-amber-500/15 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 h-5">
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase">
                          <BookMarked className="size-3" aria-hidden />
                          Premium
                        </span>
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    className={cn(
                      "line-clamp-2 text-base font-black uppercase leading-tight tracking-tight transition-colors",
                      isPremium
                        ? "text-amber-950 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-amber-200"
                        : "group-hover:text-primary"
                    )}
                  >
                    {story.title}
                  </h2>

                  {/* Author */}
                  {author && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {author.firstName} {author.lastName}
                    </p>
                  )}

                  {/* Teaser or premium placeholder */}
                  <p
                    className={cn(
                      "line-clamp-3 flex-1 text-xs leading-relaxed",
                      isPremium ? "text-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {teaser ?? (
                      isPremium
                        ? "Subscribers only. Open to read a free preview."
                        : null
                    )}
                  </p>

                  {/* CTA row */}
                  <p
                    className={cn(
                      "mt-auto flex items-center gap-1 pt-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                      isPremium
                        ? "text-amber-700 dark:text-amber-300 group-hover:text-amber-600"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {isPremium ? (
                      <>
                        <Lock className="size-3" aria-hidden />
                        Read preview
                      </>
                    ) : (
                      "Read story"
                    )}
                    <ArrowRight className="size-3 ml-auto transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </p>
                </div>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}