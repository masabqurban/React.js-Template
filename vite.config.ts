import { fileURLToPath, URL } from "node:url";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Production security headers. Mirrored in nginx.conf and vercel.json, and
 * applied to `vite preview` so the e2e suite runs under the real policy.
 * `script-src 'self'` works because index.html has no inline scripts.
 * 'unsafe-inline' styles are needed for Radix positioning and dynamic widths.
 * Add your API origin to connect-src when it differs from the app's.
 */
const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
};

export default defineConfig({
  plugins: [
    // Must run before the React plugin: it generates src/routeTree.gen.ts from
    // src/routes/ and splits every route into its own lazily loaded chunk.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    // React Compiler: automatic memoization, so no hand-written useMemo/useCallback.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173 },
  preview: { port: 4173, headers: securityHeaders },
  build: {
    // Source maps help debug production errors; serve them only to your error
    // tracker if you prefer not to expose the original source.
    sourcemap: true,
  },
});
