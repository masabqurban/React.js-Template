import { createFileRoute } from "@tanstack/react-router";

import { useSession } from "@/features/auth";
import {
  DashboardPage,
  dashboardSummaryQueryOptions,
  recentUsersQueryOptions,
} from "@/features/dashboard";

export const Route = createFileRoute("/_app/")({
  // Both requests start in parallel, before the page renders (no waterfall).
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.query({
        ...dashboardSummaryQueryOptions(),
        staleTime: "static",
      }),
      queryClient.query({ ...recentUsersQueryOptions(), staleTime: "static" }),
    ]),
  component: DashboardRoute,
});

function DashboardRoute() {
  const user = useSession();
  return <DashboardPage userName={user?.name ?? ""} />;
}
