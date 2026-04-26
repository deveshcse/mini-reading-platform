"use client"

import { dashboardPageShell } from "@/shared/lib/dashboard-shell"
import { StoryList } from "./story-list"
import { useStories } from "../hooks/use-stories"
import { cn } from "@/lib/utils"

export function LandingStoryFeed() {
  const { data, isLoading, error } = useStories({ isPublished: true })

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
          className="text-2xl leading-none font-black tracking-tighter uppercase italic sm:text-3xl md:text-4xl"
        >
          Latest <span className="text-primary not-italic">stories</span>
        </h2>
        <p className="mt-2 max-w-2xl text-xs font-bold tracking-tight text-muted-foreground uppercase sm:text-sm">
          The same published feed as the app — browse as a guest or sign in to
          save your place. Gold-bordered cards are premium; open one for a
          preview or full read when your plan allows.
        </p>
      </div>
      <StoryList stories={data?.stories} isLoading={isLoading} error={error} />
    </section>
  )
}
