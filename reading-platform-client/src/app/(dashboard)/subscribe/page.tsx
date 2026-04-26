"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { PageBackLink } from "@/shared/components/page-back-link";

/**
 * Placeholder for subscription / billing. Premium story CTAs link here until the payments API is wired.
 */
export default function SubscribePage() {
  return (
    <div className="app-page space-y-6">
      <PageBackLink href="/stories" label="Back to feed" />
      <div className="mx-auto max-w-2xl space-y-8 border-2 border-border bg-card p-8 sm:p-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Choose a <span className="not-italic text-primary">Plan</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Subscription checkout will connect to your platform backend (plans, payments, webhooks)
            when you enable it.
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For now, this is a dedicated route for premium story CTAs. Implement Razorpay or your
          provider against the <code className="text-xs font-mono">Subscription</code> and{" "}
          <code className="text-xs font-mono">Plan</code> models on the server, then replace this page
          with a real catalog and checkout.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled
            title="Connect billing on the server to enable checkout"
            className="h-12 rounded-none border-2 px-6 font-black uppercase tracking-widest opacity-60"
          >
            <Sparkles className="mr-2 size-4" />
            Start membership (soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
