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
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(9);

  const { data, isLoading, error } = useStories({
    isPublished: true,
    page,
    pageSize,
  });

  const handlePageSizeChange = (next: number) => {
    setPageSize(next);
    setPage(1);
  };

  return (
    <div className={cn(dashboardPageShell, "space-y-8 sm:space-y-12")}>
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Story feed
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Latest stories
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Browse published work from the community. Stories marked Premium include a short preview here;
              subscribers can read the full piece on the story page.
            </p>
          </div>

          <Can resource="story" action="create">
            <Button
              asChild
              size="sm"
              className="w-full rounded-md border font-medium sm:w-auto"
            >
              <Link href="/stories/create" className="inline-flex items-center justify-center gap-2">
                <Plus className="size-4 shrink-0" aria-hidden />
                New story
              </Link>
            </Button>
          </Can>
        </div>

        <StoryList
          stories={data?.stories}
          isLoading={isLoading}
          error={error}
          meta={data?.meta}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
    </div>
  );
}
