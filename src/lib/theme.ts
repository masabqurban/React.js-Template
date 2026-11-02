import { useSyncExternalStore } from "react";

export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

/** Same key as public/theme-init.js, which applies the theme before first paint. */
const STORAGE_KEY = "theme";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && darkQuery().matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
  apply(theme);
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Follow the OS setting live while the preference is "system".
  const onSystemChange = () => {
    if (readTheme() === "system") apply("system");
  };
  const query = darkQuery();
  query.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", onSystemChange);
  };
}

/** Light, dark or system theme, shared across components without a context provider. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme);
  return { theme, setTheme };
}
