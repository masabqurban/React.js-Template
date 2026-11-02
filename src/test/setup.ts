import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";

import { resetDb } from "@/mocks/db";
import { server } from "@/mocks/node";

// Any request without a handler is a bug in the test, so fail loudly.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  sessionStorage.clear();
});
afterAll(() => server.close());
