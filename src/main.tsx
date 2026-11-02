import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { AppProviders } from "@/app/providers";
import { router } from "@/app/router";
import { mocksEnabled } from "@/config/env";

import "@fontsource-variable/inter";
import "./index.css";

async function startMocks() {
  if (!mocksEnabled) return;
  // Dynamic import: with mocks off, MSW and the seed data are never downloaded.
  const { startMockWorker } = await import("@/mocks/browser");
  await startMockWorker();
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

// The mock API must be listening before the first request goes out.
void startMocks().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
