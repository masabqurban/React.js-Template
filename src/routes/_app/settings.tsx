import { createFileRoute } from "@tanstack/react-router";

import { useSession } from "@/features/auth";
import { SettingsPage } from "@/features/settings";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsRoute,
});

function SettingsRoute() {
  const user = useSession();
  // The _app layout guarantees a session; this only narrows the type.
  return user ? <SettingsPage user={user} /> : null;
}
