import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { RouterContext } from "@/app/router-context";

export const Route = createRootRouteWithContext<RouterContext>()({
  // Restore a session from the refresh token before any guard runs.
  beforeLoad: ({ context }) => context.auth.hydrate(),
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
