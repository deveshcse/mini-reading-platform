"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

// interface PremiumReadGateProps {
//   storyId: number;
// }

export function PremiumReadGate() {
  return (
    <section
      className="border-2 border-amber-500/40 bg-amber-500/5 px-4 py-8 sm:px-8 sm:py-10 md:px-10"
      aria-labelledby="premium-gate-title"
    >
      <div className="mx-auto max-w-md space-y-6 text-center">

        <div className="mx-auto flex size-12 items-center justify-center border-2 border-amber-500/40 bg-amber-500/10">
          <Lock className="size-5 text-amber-700 dark:text-amber-300" aria-hidden />
        </div>

        <div className="space-y-2">
          <h2
            id="premium-gate-title"
            className="text-xl font-black uppercase tracking-tight"
          >
            You&apos;ve reached the end of the preview
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Subscribe to read the full story and unlock every premium title in the archive.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="rounded-none border-2 border-amber-600/60 bg-amber-600 font-black uppercase tracking-widest text-xs text-amber-50 hover:bg-amber-600/90 h-11 px-8"
          >
            <Link href="/subscribe" className="inline-flex items-center gap-2">
              <Sparkles className="size-3.5" aria-hidden />
              View plans
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border-2 font-bold uppercase tracking-widest text-xs h-11 px-6"
          >
            <Link href="/stories">Back to feed</Link>
          </Button>
        </div>

      </div>
    </section>
  );
}