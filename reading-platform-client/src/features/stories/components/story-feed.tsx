"use client";

import React from "react";
import { StoryList } from "@/features/stories/components/story-list";
import { useStories } from "@/features/stories/hooks/use-stories";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Can } from "@/shared/components/can";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

/**
 * Public feed of published stories (used at `/` and `/stories` under the dashboard layout).
 */
export function StoryFeed() {
  const { data, isLoading, error } = useStories({ isPublished: true });

  return (
    <div className={cn(dashboardPageShell, "space-y-8 sm:space-y-12")}>
        <div className="flex flex-col gap-6 border-b-4 border-primary pb-6 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter italic sm:text-4xl md:text-5xl">
              The <span className="text-primary not-italic">Inkwell</span> Feed
            </h1>
            <p className="max-w-2xl text-xs font-bold uppercase tracking-tight text-muted-foreground sm:text-sm">
              Discover the latest stories.{" "}
              <span className="text-foreground/80">
                Gold-bordered cards are paid stories: you see a teaser here; the full text follows your plan on the story page.
              </span>
            </p>
          </div>

          <Can resource="story" action="create">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-none border-b-4 border-r-4 border-primary/50 px-6 font-black uppercase tracking-widest italic shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:border-transparent sm:h-14 sm:w-auto sm:px-8"
            >
              <Link href="/stories/create" className="flex items-center justify-center gap-2">
                <Plus className="size-5 not-italic" />
                Write Story
              </Link>
            </Button>
          </Can>
        </div>

        <StoryList stories={data?.stories} isLoading={isLoading} error={error} />
    </div>
  );
}
