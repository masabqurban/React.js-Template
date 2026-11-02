import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "./api-error";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 30s: navigating back and forth doesn't refetch.
        staleTime: 30_000,
        // Retrying a 4xx never helps and only adds load to the API.
        retry: (failureCount, error) =>
          !(isApiError(error) && error.isClientError) && failureCount < 2,
      },
      mutations: {
        // Writes are never replayed automatically: a retried POST can duplicate data.
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();
