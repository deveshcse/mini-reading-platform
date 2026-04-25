"use client";

import { StoryFeed } from "@/features/stories/components/StoryFeed";

/**
 * Main story feed at `/stories` — same content as the dashboard home, matches post-login redirect.
 */
export default function StoriesIndexPage() {
  return <StoryFeed />;
}
