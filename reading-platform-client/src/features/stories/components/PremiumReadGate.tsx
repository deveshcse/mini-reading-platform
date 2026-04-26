"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookMarked, Lock, Sparkles } from "lucide-react";

interface PremiumReadGateProps {
  storyId: number;
}

/**
 * Shown when `GET /stories/:id` returns `isLocked: true` for a premium story (no active subscription).
 */
export function PremiumReadGate({ storyId }: PremiumReadGateProps) {
  return (
    <section
      className="relative overflow-hidden rounded-none border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-card to-amber-500/5 p-6 sm:p-8"
      aria-labelledby="premium-gate-title"
    >
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative space-y-4 text-center sm:flex sm:items-center sm:justify-between sm:gap-8 sm:text-left">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <div className="flex size-10 items-center justify-center border-2 border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200">
              <Lock className="size-5" aria-hidden />
            </div>
            <h2
              id="premium-gate-title"
              className="text-lg font-black uppercase tracking-tight text-amber-950 dark:text-amber-100"
            >
              Continue reading
            </h2>
          </div>
          <p className="max-w-md text-sm font-bold leading-relaxed text-muted-foreground">
            You&apos;re seeing a short preview. Subscribe to read the full story, support authors, and
            unlock every premium title in the library.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-[200px]">
          <Button
            asChild
            className="rounded-none border-2 border-amber-600/60 bg-amber-600 text-amber-50 hover:bg-amber-600/90 font-black uppercase tracking-widest text-xs h-12"
          >
            <Link href="/subscribe" className="inline-flex items-center justify-center gap-2">
              <Sparkles className="size-4" />
              View plans
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-none text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            <Link href="/stories">Back to feed</Link>
          </Button>
        </div>
      </div>
      <p className="relative mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-amber-800/80 dark:text-amber-200/80 sm:text-left">
        <BookMarked className="mb-0.5 inline size-3 align-middle" aria-hidden />
        <span className="ml-1">Story #{storyId}</span> — full text unlocks with an active subscription
      </p>
    </section>
  );
}
