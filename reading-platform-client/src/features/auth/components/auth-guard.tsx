"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthContext } from "./auth-provider"
import { isPublicDashboardPath } from "@/features/auth/lib/public-dashboard-paths"

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const allowGuest = isPublicDashboardPath(pathname)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !allowGuest) {
      const path =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(path)}`)
    }
  }, [isLoading, isAuthenticated, allowGuest, router, pathname])

  if (isLoading && !allowGuest) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated && !allowGuest) {
    return null
  }

  return <>{children}</>
}
