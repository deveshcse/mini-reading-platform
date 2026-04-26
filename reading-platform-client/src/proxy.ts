import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js 16+ Proxy (replaces Middleware naming). See:
 * https://nextjs.org/docs/app/getting-started/proxy
 *
 * Blocks auth pages when a refresh session cookie exists (set by API as `refreshToken`).
 * Note: the cookie must be sent to this origin (same-site / BFF). If the API runs on
 * another host without shared cookies, this optimistic redirect will not see the cookie.
 */
const AUTH_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute = AUTH_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (!isAuthRoute) {
    return NextResponse.next()
  }

  const hasRefresh = Boolean(request.cookies.get("refreshToken")?.value)
  if (!hasRefresh) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/stories"
  url.search = ""
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
  ],
}
