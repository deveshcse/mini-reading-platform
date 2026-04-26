"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { PageBackLink } from "@/shared/components/page-back-link";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

/**
 * Placeholder for subscription / billing. Premium story CTAs link here until the payments API is wired.
 */
export default function SubscribePage() {
  return (
    <div className={cn(dashboardPageShell, "space-y-6")}>
      <PageBackLink href="/stories" label="Back to feed" />
      <div className="mx-auto w-full max-w-2xl space-y-6 border-2 border-border bg-card p-5 sm:space-y-8 sm:p-8 lg:p-12">
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic sm:text-3xl md:text-4xl">
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
