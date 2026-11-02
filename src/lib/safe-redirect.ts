/**
 * Only allow same-origin paths after sign-in, so `?redirect=` can't be used
 * to send users to another site (open redirect).
 */
export function safeRedirectPath(
  value: string | undefined,
  fallback = "/",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value;
}
