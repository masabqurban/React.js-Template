import { useSyncExternalStore } from "react";

import { refreshSession, tokenStore } from "@/lib/api";

import { fetchMe, logout } from "./api/auth.api";
import type { SessionUser } from "./schemas/auth.schema";

/*
 * The session lives outside React, so the router's `beforeLoad` guards can
 * read it synchronously and components subscribe with useSyncExternalStore
 * (no context provider, no re-render of the whole tree on change).
 */
let user: SessionUser | null = null;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setUser(next: SessionUser | null) {
  user = next;
  listeners.forEach((listener) => {
    listener();
  });
}

/**
 * Restores the session after a page reload from the tab-scoped refresh
 * token. Safe to call on every navigation: concurrent callers share one
 * promise and a signed-in session returns immediately.
 */
function hydrate(): Promise<void> {
  if (user || !tokenStore.getRefresh()) return Promise.resolve();
  hydrating ??= (async () => {
    try {
      if (await refreshSession()) setUser(await fetchMe());
    } catch {
      tokenStore.clear();
      setUser(null);
    }
  })().finally(() => {
    hydrating = null;
  });
  return hydrating;
}

export const sessionStore = {
  get: () => user,
  isAuthenticated: () => user !== null,
  hydrate,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** After a successful login, or when the user edits their own profile. */
  setUser,
  async signOut() {
    const refreshToken = tokenStore.getRefresh();
    tokenStore.clear();
    setUser(null);
    if (refreshToken) {
      // Best effort: the session is already gone locally.
      await logout(refreshToken).catch(() => undefined);
    }
  },
};

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
}
