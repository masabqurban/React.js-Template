import type { Tokens } from "./schemas";

/**
 * The access token lives in memory only (never localStorage), so an XSS bug
 * can't read a long-lived credential from storage. The refresh token is kept
 * in sessionStorage: scoped to the tab and cleared when it closes, so a page
 * reload can restore the session.
 *
 * If your API can set an httpOnly refresh cookie, prefer that and drop the
 * sessionStorage part entirely.
 */
const REFRESH_KEY = "auth:refresh-token";

let accessToken: string | null = null;

function readRefresh(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function writeRefresh(token: string | null) {
  try {
    if (token) sessionStorage.setItem(REFRESH_KEY, token);
    else sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    // Storage blocked (private mode): the session lasts until reload.
  }
}

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: readRefresh,
  setTokens: (tokens: Tokens) => {
    accessToken = tokens.accessToken;
    writeRefresh(tokens.refreshToken);
  },
  clear: () => {
    accessToken = null;
    writeRefresh(null);
  },
};
