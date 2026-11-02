import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { sessionStore, useSession } from "@/features/auth";

/**
 * Pathless layout for every signed-in screen. Add new pages under routes/_app/.
 * This guard only controls the UI: the API must authorise every request itself.
 */
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const user = useSession();
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();

  if (!user) return null;

  const signOut = () => {
    void (async () => {
      await sessionStore.signOut();
      // Don't leave one user's cached data behind for the next person on this device.
      queryClient.clear();
      await navigate({ to: "/login", search: {} });
    })();
  };

  return (
    <AppShell user={user} onSignOut={signOut}>
      <Outlet />
    </AppShell>
  );
}
