"use client";

import React from "react";
import Link from "next/link";
import type { StoryWithAccess } from "@/features/stories/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/shared/components/can";
import { BookMarked, Pencil, Eye } from "lucide-react";
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

  return (
    <article className={cn("max-w-3xl mx-auto space-y-8", className)}>
      {story.coverImage && (
        <div className="border-2 border-border overflow-hidden bg-muted aspect-[2/1] max-h-[min(50vh,420px)] w-full">
          <img
            src={story.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="space-y-4 border-b-4 border-primary/30 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {story.isPremium && (
            <Badge className="rounded-none text-[10px] font-black uppercase gap-1.5 h-7">
              <BookMarked className="size-3.5" />
              Premium
            </Badge>
          )}
          {story.isLocked && (
            <Badge variant="secondary" className="rounded-none text-[10px] font-black uppercase">
              Preview
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
          <p className="text-lg text-muted-foreground font-medium leading-relaxed not-italic">
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

      {story.isLocked && (
        <p className="border-2 border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold text-amber-800 dark:text-amber-200">
          This is a premium story. Subscribe to read the full content.
        </p>
      )}

      <div
        className="story-html prose prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium"
        data-story-content
        dangerouslySetInnerHTML={{ __html: story.content }}
      />
    </article>
  );
}
