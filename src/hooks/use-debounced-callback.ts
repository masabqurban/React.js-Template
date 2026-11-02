import { useEffect, useRef } from "react";

/**
 * Returns a function that runs `callback` once calls stop for `delayMs`.
 * Used for search-as-you-type, so the URL (and the API) update once per pause
 * instead of once per keystroke. Pending calls are cancelled on unmount.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 300,
) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  return (...args: Args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      latest.current(...args);
    }, delayMs);
  };
}
