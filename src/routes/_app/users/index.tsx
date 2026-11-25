import { createFileRoute } from "@tanstack/react-router";

import { useSession } from "@/features/auth";
import {
  UsersPage,
  usersQueryOptions,
  usersSearchSchema,
} from "@/features/users";
import { mergeSearch } from "@/lib/list-search";

export const Route = createFileRoute("/_app/users/")({
  // Page, search and filters are validated URL state: shareable and back-button friendly.
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.query({
      ...usersQueryOptions(deps),
      staleTime: "static",
    }),
  component: UsersRoute,
});

function UsersRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const currentUser = useSession();

  return (
    <UsersPage
      search={search}
      canManage={currentUser?.role === "admin"}
      currentUserId={currentUser?.id}
      onSearchChange={(patch) =>
        void navigate({
          search: (prev) => mergeSearch(prev, patch),
          replace: true,
        })
      }
    />
  );
}
