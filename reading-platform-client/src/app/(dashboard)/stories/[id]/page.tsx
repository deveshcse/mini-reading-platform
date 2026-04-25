"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useStory } from "@/features/stories/hooks/use-stories";
import { StoryDetail } from "@/features/stories/components/StoryDetail";
import { Loader2, BookX } from "lucide-react";

export default function StoryPage() {
  const params = useParams();
  const id = Number(params.id);
  
  const { data: story, isLoading, error } = useStory(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary/60" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Unrolling the parchment...
        </p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-destructive/10 text-destructive flex items-center justify-center border-2 border-destructive/20">
          <BookX className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Story Not Found</h1>
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest max-w-xs mx-auto">
            The story you're looking for has vanished or never existed in our archives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <StoryDetail story={story} />
    </div>
  );
}
