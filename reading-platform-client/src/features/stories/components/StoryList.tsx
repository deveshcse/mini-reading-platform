"use client";

import React from "react";
import Link from "next/link";
import type { Story } from "@/features/stories/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookMarked, BookOpen, Loader2, AlertCircle } from "lucide-react";
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
        return (
          <li key={story.id}>
            <Link href={`/stories/${story.id}`} className="block h-full group">
              <Card className="h-full rounded-none border-2 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/60 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                {story.coverImage && (
                  <div className="relative aspect-[16/10] w-full border-b-2 border-border overflow-hidden bg-muted">
                    <img
                      src={story.coverImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {!story.isPublished && (
                      <Badge variant="secondary" className="rounded-none text-[9px] font-black uppercase">
                        Draft
                      </Badge>
                    )}
                    {story.isPremium && (
                      <Badge className="rounded-none text-[9px] font-black uppercase gap-1">
                        <BookMarked className="size-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-base font-black uppercase leading-tight tracking-tight group-hover:text-primary">
                    {story.title}
                  </CardTitle>
                  {author && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {author.firstName} {author.lastName}
                    </p>
                  )}
                </CardHeader>
                {story.description && (
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 text-xs font-medium leading-relaxed">
                      {story.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
