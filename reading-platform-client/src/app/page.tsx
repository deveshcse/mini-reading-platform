import { Header } from "@/shared/components/header"
import { LandingHeroCTAs } from "@/shared/components/landing-hero-ctas"
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
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Read and publish stories
              </h1>
              <p className="mx-auto max-w-[600px] text-lg leading-relaxed text-muted-foreground">
                Browse the library, share your own work, and subscribe when you
                want full access to premium titles.
              </p>
            </div>

            <LandingHeroCTAs />

            <div className="mt-8 grid grid-cols-1 gap-8 text-sm sm:mt-12 sm:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
                <span className="flex items-center gap-2 font-semibold text-primary">
                  <BookOpen className="size-4" aria-hidden /> Stories
                </span>
                <p className="text-muted-foreground">
                  Explore published pieces from the community.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
                <span className="flex items-center gap-2 font-semibold text-primary">
                  <Sparkles className="size-4" aria-hidden /> Write
                </span>
                <p className="text-muted-foreground">
                  Draft and publish your own stories when you sign up as an author.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
                <span className="flex items-center gap-2 font-semibold text-primary">
                  <Lock className="size-4" aria-hidden /> Premium
                </span>
                <p className="text-muted-foreground">
                  Subscribe for full access to paid stories; checkout is secure.
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