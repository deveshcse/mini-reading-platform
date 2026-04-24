"use client"

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/tasks");
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
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <CheckCircle2 className="size-10" />
        </div>
        
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            Master Your Daily <span className="text-primary italic">Workflow</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
            Stay organized, focused, and productive. The simplest way to track your tasks and crush your goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="h-12 px-8 min-w-[160px] shadow-lg shadow-primary/20">
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 min-w-[160px] bg-background/50 backdrop-blur-sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50">
            <span className="font-bold text-primary">Simple CRUD</span>
            <p className="text-muted-foreground">Easy task creation, editing, and deletion.</p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50">
            <span className="font-bold text-primary">Smart Filters</span>
            <p className="text-muted-foreground">Search and filter by status effortlessly.</p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-card/50">
            <span className="font-bold text-primary">Fast & Secure</span>
            <p className="text-muted-foreground">Built with Next.js and secure JWT auth.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
