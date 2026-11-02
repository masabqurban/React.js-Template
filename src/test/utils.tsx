import type { ReactElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createQueryClient, tokenStore } from "@/lib/api";

/** Renders with a fresh QueryClient per test, so cached data never leaks between tests. */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    ),
  };
}

/** Signs in as the seeded demo admin by issuing a token the mock API accepts. */
export function signInAsDemo() {
  tokenStore.setTokens({
    accessToken: `mock-access.usr_0001.${Date.now() + 60_000}`,
    refreshToken: "mock-refresh.usr_0001",
  });
}
