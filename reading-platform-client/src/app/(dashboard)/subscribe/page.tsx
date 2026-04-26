"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

/**
 * Placeholder for subscription / billing. Premium story CTAs link here until the payments API is wired.
 */
export default function SubscribePage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl space-y-8 border-2 border-border bg-card p-8 sm:p-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Choose a <span className="not-italic text-primary">Plan</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Subscription checkout will connect to your platform backend (plans, payments, webhooks) when
            you enable it.
          </p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For now, this is a dedicated route for premium story CTAs. Implement Razorpay or your
          provider against the <code className="text-xs font-mono">Subscription</code> and{" "}
          <code className="text-xs font-mono">Plan</code> models on the server, then replace this
          page with a real catalog and checkout.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled
            title="Connect billing on the server to enable checkout"
            className="rounded-none border-2 font-black uppercase tracking-widest h-12 px-6 opacity-60"
          >
            <Sparkles className="size-4 mr-2" />
            Start membership (soon)
          </Button>
          <Button asChild variant="outline" className="rounded-none border-2 font-bold uppercase text-xs h-12">
            <Link href="/stories" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to feed
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
