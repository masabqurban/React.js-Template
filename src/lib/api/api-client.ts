import { apiBaseUrl } from "@/config/env";

import { createHttpClient } from "./http-client";
import { dataEnvelope, tokensSchema } from "./schemas";
import { tokenStore } from "./token-store";

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Exchanges the refresh token for new tokens. Single-flight: when several
 * requests hit a 401 at once, they all wait on one refresh call instead of
 * racing (and invalidating each other's refresh tokens).
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) return false;
    try {
      // A separate client without onUnauthorized, so a failing refresh can't recurse.
      const { data } = await bareClient.post("/auth/refresh", {
        schema: dataEnvelope(tokensSchema),
        body: { refreshToken },
      });
      tokenStore.setTokens(data);
      return true;
    } catch {
      tokenStore.clear();
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

const bareClient = createHttpClient({ baseUrl: apiBaseUrl });

/** The single client every feature uses to call the API. */
export const api = createHttpClient({
  baseUrl: apiBaseUrl,
  getHeaders: (): Record<string, string> => {
    const token = tokenStore.getAccess();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  onUnauthorized: refreshSession,
});
