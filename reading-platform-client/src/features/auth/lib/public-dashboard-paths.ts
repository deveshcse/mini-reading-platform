/**
 * Routes under (dashboard) that guests may open (matches server optional auth on GET /stories).
 */
export function isPublicDashboardPath(pathname: string): boolean {
  if (pathname === "/stories" || pathname === "/subscribe") return true
  return /^\/stories\/\d+$/.test(pathname)
}
