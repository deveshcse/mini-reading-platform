"use client";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, BookOpen, Sparkles, Lock } from "lucide-react";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/"); // redirect to story feed
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <BookOpen className="size-10" />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            Discover & Share <span className="text-primary italic">Stories</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
            Explore engaging stories, publish your own, and unlock premium content with seamless access.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 min-w-[160px] shadow-lg shadow-primary/20"
          >
            <Link href="/register">Start Reading</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-8 min-w-[160px] bg-background/50 backdrop-blur-sm"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50">
            <span className="flex items-center gap-2 font-bold text-primary">
              <BookOpen className="size-4" /> Story Feed
            </span>
            <p className="text-muted-foreground">
              Browse and discover stories from different authors.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50">
            <span className="flex items-center gap-2 font-bold text-primary">
              <Sparkles className="size-4" /> Create Stories
            </span>
            <p className="text-muted-foreground">
              Write, edit, and publish your own content easily.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50">
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
  );
}