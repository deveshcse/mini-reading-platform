"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/features/auth/components/auth-provider";

export function LandingHeroCTAs() {
  const { user, isLoading } = useAuthContext();

  if (!isLoading && user) {
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto">
        <Button asChild size="lg" className="h-12 min-w-40 px-8">
          <Link href="/stories">Browse stories</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 min-w-40 px-8">
          <Link href="/subscribe">Subscription</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto">
      <Button asChild size="lg" className="h-12 min-w-40 px-8">
        <Link href="/auth/register">Start reading</Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="h-12 min-w-40 px-8">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}
