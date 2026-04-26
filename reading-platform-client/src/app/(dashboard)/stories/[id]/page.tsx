"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStory } from "@/features/stories/hooks/use-stories";
import { Loader2, BookX } from "lucide-react";
import { StoryDetail } from "@/features/stories/components/story-detail";
import { PageBackLink } from "@/shared/components/page-back-link";
import { Button } from "@/components/ui/button";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

export default function StoryPage() {
  const params = useParams();
  const id = Number(params.id);
  
  const { data: story, isLoading, error } = useStory(id);

  if (isLoading) {
    return (
      <div className={cn(dashboardPageShell, "space-y-6")}>
        <PageBackLink href="/stories" label="Back to feed" />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-8">
        <Loader2 className="size-12 animate-spin text-primary/60" />
        <p className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Unrolling the parchment...
        </p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className={cn(dashboardPageShell, "flex min-h-[60vh] flex-col items-center justify-center gap-6 px-2 py-12 text-center")}>
        <PageBackLink href="/stories" label="Back to feed" className="self-start" />
        <div className="flex size-20 items-center justify-center border-2 border-destructive/20 bg-destructive/10 text-destructive">
          <BookX className="size-10" />
        </div>
        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter sm:text-3xl">Story Not Found</h1>
            <p className="mx-auto max-w-xs text-xs font-bold uppercase tracking-widest text-muted-foreground sm:max-w-md sm:text-sm">
              The story you&apos;re looking for has vanished or never existed in our archives.
            </p>
          </div>
          <Button asChild className="rounded-none border-2 font-black uppercase text-xs">
            <Link href="/stories">Browse the feed</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(dashboardPageShell, "space-y-6 sm:space-y-8")}>
      <PageBackLink href="/stories" label="Back to feed" />
      <StoryDetail story={story} />
    </div>
  );
}
