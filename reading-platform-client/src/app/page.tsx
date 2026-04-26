import { Button } from "@/components/ui/button"
import { Header } from "@/shared/components/header"
import Link from "next/link"
import { BookOpen, Lock, Sparkles } from "lucide-react"
import { LandingStoryFeed } from "@/features/stories/components/landing-page-story-feed"

export default function Page() {
  return (
    <>
      <Header variant="public" />

      <div className="flex min-h-svh flex-col bg-background">
        {/* Hero */}
        <div className="animate-fade-in flex flex-col items-center justify-center p-4 text-center">
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
              <Button asChild size="lg" className="h-12 min-w-[160px] px-8">
                <Link href="/auth/register">Start Reading</Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="h-12 min-w-[160px] px-8">
                <Link href="/auth/login">Sign In</Link>
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

        {/* Client Component */}
        <LandingStoryFeed />
      </div>
    </>
  )
}