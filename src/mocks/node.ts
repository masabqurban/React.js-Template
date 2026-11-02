import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/** The same handlers, intercepting `fetch` in Vitest. */
export const server = setupServer(...handlers);
