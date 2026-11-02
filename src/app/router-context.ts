import type { QueryClient } from "@tanstack/react-query";

/** Dependencies every route can read in `beforeLoad` and `loader` via `context`. */
export type RouterContext = {
  queryClient: QueryClient;
  auth: {
    isAuthenticated: () => boolean;
    hydrate: () => Promise<void>;
  };
};
