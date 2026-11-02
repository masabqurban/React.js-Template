import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Tests call the same MSW handlers the app uses in development.
    env: { VITE_API_URL: "http://localhost/api", VITE_ENABLE_MOCKS: "false" },
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/features/**"],
      exclude: ["**/*.test.*", "**/index.ts"],
      reporter: ["text", "html"],
    },
  },
});
