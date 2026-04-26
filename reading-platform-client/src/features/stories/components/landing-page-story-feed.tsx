"use client"

import React from "react"
import { dashboardPageShell } from "@/shared/lib/dashboard-shell"
import { StoryList } from "./story-list"
import { useStories } from "../hooks/use-stories"
import { cn } from "@/lib/utils"

export function LandingStoryFeed() {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(9)

  const { data, isLoading, error } = useStories({
    isPublished: true,
    page,
    pageSize,
  })

  const handlePageSizeChange = (next: number) => {
    setPageSize(next)
    setPage(1)
  }

  return (
    <section
      className={cn(
        "home-landing-stories",
        dashboardPageShell,
        "space-y-8 pb-16 sm:space-y-10 sm:pb-20"
      )}
      aria-labelledby="landing-feed-heading"
    >
      <div className="border-b border-border pb-8">
        <h2
          id="landing-feed-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Latest stories
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Browse published work from the community. Stories marked Premium
          include a short preview here; subscribers can read the full piece on
          the story page.
        </p>
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
    </section>
  )
}
