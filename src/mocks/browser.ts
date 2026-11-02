import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

/** Starts the mock API in the browser. Loaded lazily, so it never ships when mocks are off. */
export async function startMockWorker() {
  await setupWorker(...handlers).start({
    serviceWorker: { url: "/mockServiceWorker.js" },
    // Assets, fonts and third-party calls go to the network as normal.
    onUnhandledFrame: "bypass",
    quiet: import.meta.env.PROD,
  });
}
