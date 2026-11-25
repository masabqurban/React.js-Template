import { createFileRoute, notFound } from "@tanstack/react-router";

import { useSession } from "@/features/auth";
import { UserDetailPage, userQueryOptions } from "@/features/users";
import { isApiError } from "@/lib/api";

export const Route = createFileRoute("/_app/users/$userId")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.query({
        ...userQueryOptions(params.userId),
        staleTime: "static",
      });
    } catch (error) {
      // A missing user is a 404 screen, not a generic error.
      if (isApiError(error) && error.isNotFound) throw notFound();
      throw error;
    }
  },
  component: UserDetailRoute,
});

function UserDetailRoute() {
  const { userId } = Route.useParams();
  const navigate = Route.useNavigate();
  const currentUser = useSession();
  return (
    <UserDetailPage
      userId={userId}
      canManage={currentUser?.role === "admin"}
      isSelf={currentUser?.id === userId}
      onDeleted={() => void navigate({ to: "/users" })}
    />
  );
}
