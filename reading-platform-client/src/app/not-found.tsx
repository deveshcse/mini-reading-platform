"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

const REDIRECT_MS = 900
const FALLBACK_HREF = "/"
/** Avoid duplicate toasts when React Strict Mode re-runs effects in development. */
let lastNotFoundToastAt = 0
const TOAST_DEBOUNCE_MS = 1500

/**
 * Shown for unknown URLs (no matching route). Toasts once, then sends users home.
 * Manual link available if navigation is blocked or delayed.
 */
export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const now = Date.now()
    if (now - lastNotFoundToastAt >= TOAST_DEBOUNCE_MS) {
      lastNotFoundToastAt = now
      toast.warning("This page isn’t available", {
        description: "That route doesn’t exist here. Taking you to the home page.",
        duration: 5000,
      })
    }

    const timer = window.setTimeout(() => {
      router.replace(FALLBACK_HREF)
    }, REDIRECT_MS)

    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          404 · Not found
        </p>
        <p className="text-sm font-bold text-foreground">
          Redirecting to home…
        </p>
      </div>
      <Link
        href={FALLBACK_HREF}
        className="text-sm font-black uppercase tracking-widest text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Go to home now
      </Link>
    </div>
  )
}
