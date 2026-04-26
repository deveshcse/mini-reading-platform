"use client";

import { Button } from "@/components/ui/button";
import { useStories } from "@/features/stories/hooks/use-stories";
import { StoryList } from "@/features/stories/components/story-list";
import { Header } from "@/shared/components/header";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import Link from "next/link";
import { BookOpen, Loader2, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Scoped CSS: soft fade-up on the marketing page only */
const LANDING_STYLE = `
@keyframes home-landing-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.home-landing-hero {
  animation: home-landing-fade-up 0.85s ease-out forwards;
  opacity: 0;
}
.home-landing-stories {
  animation: home-landing-fade-up 0.85s ease-out 0.18s forwards;
  opacity: 0;
}
`;

function LandingStoryFeed() {
  const { data, isLoading, error } = useStories({ isPublished: true });

  return (
    <section
      className={cn(
        "home-landing-stories",
        dashboardPageShell,
        "space-y-8 pb-16 sm:space-y-10 sm:pb-20"
      )}
      aria-labelledby="landing-feed-heading"
    >
      <div className="border-b-4 border-primary pb-6 sm:pb-8">
        <h2
          id="landing-feed-heading"
          className="text-2xl font-black uppercase leading-none tracking-tighter italic sm:text-3xl md:text-4xl"
        >
          Latest <span className="text-primary not-italic">stories</span>
        </h2>
        <p className="mt-2 max-w-2xl text-xs font-bold uppercase tracking-tight text-muted-foreground sm:text-sm">
          The same published feed as the app — browse as a guest or sign in to save your place.
          Gold-bordered cards are premium; open one for a preview or full read when your plan
          allows.
        </p>
      </div>
      <StoryList stories={data?.stories} isLoading={isLoading} error={error} />
    </section>
  );
}

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_STYLE }} />
      <Header variant="public" />
      <div className="min-h-svh flex flex-col bg-background">
        <div className="home-landing-hero flex flex-col items-center justify-center px-4 py-10 text-center sm:py-14 md:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <BookOpen className="size-10" />
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                Discover & Share{" "}
                <span className="text-primary italic">Stories</span>
              </h1>
              <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
                Explore engaging stories, publish your own, and unlock premium
                content with seamless access.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto">
              <Button
                asChild
                size="lg"
                className="h-12 min-w-[160px] px-8 shadow-lg shadow-primary/20"
              >
                <Link href="/register">Start Reading</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 min-w-[160px] bg-background/50 px-8 backdrop-blur-sm"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 text-sm sm:mt-12 sm:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
                <span className="flex items-center gap-2 font-bold text-primary">
                  <BookOpen className="size-4" /> Story Feed
                </span>
                <p className="text-muted-foreground">
                  Browse and discover stories from different authors.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
                <span className="flex items-center gap-2 font-bold text-primary">
                  <Sparkles className="size-4" /> Create Stories
                </span>
                <p className="text-muted-foreground">
                  Write, edit, and publish your own content easily.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
                <span className="flex items-center gap-2 font-bold text-primary">
                  <Lock className="size-4" /> Premium Access
                </span>
                <p className="text-muted-foreground">
                  Unlock exclusive stories via secure payments.
                </p>
              </div>
            </div>
          </div>
        </div>

        <LandingStoryFeed />
      </div>
    </>
  );
}
