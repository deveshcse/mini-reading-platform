/**
 * Returns a same-origin relative path safe to pass to router.push, or null.
 * Rejects open-redirect patterns (//evil.com, https:, javascript:, etc.).
 */
export function getSafeRedirectPath(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  const noHash = trimmed.split("#")[0] ?? trimmed;
  if (/^[\\/]*(javascript|data):/i.test(noHash)) return null;
  if (noHash.includes("://")) return null;
  return noHash;
}
