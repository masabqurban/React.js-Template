import { createRouter } from "@tanstack/react-router";

import {
  RouteError,
  RouteNotFound,
  RoutePending,
} from "@/components/route-status";
import { sessionStore } from "@/features/auth";
import { queryClient } from "@/lib/api";
import { routeTree } from "@/routeTree.gen";

export const router = createRouter({
  routeTree,
  context: { queryClient, auth: sessionStore },
  // Hovering or focusing a link prefetches the route's code and data.
  defaultPreload: "intent",
  // TanStack Query owns data freshness, so the router doesn't cache loader results itself.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultPendingComponent: RoutePending,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
});

// Registers the router type globally: every <Link to>, params and search are type-checked.
declare module "@tanstack/react-router" {
  // Declaration merging only works with interfaces.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}
