import { z } from "zod";

/**
 * Validated build-time environment. Only `VITE_*` variables reach the bundle,
 * and everything in it is public: never put a secret in a Vite env var.
 * A malformed value fails at startup instead of as a confusing runtime bug.
 */
const envSchema = z.object({
  VITE_API_URL: z.url().optional(),
  VITE_ENABLE_MOCKS: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  VITE_APP_NAME: z.string().min(1).default("Acme Admin"),
});

/** An empty `VITE_X=` line in .env means "not set", so defaults still apply. */
const read = (value: string | undefined) => (value === "" ? undefined : value);

export const env = envSchema.parse({
  VITE_API_URL: read(import.meta.env.VITE_API_URL),
  VITE_ENABLE_MOCKS: read(import.meta.env.VITE_ENABLE_MOCKS),
  VITE_APP_NAME: read(import.meta.env.VITE_APP_NAME),
});

/**
 * Mocks default to ON until a real API is configured, so a fresh clone runs
 * with `npm run dev` alone, and a build pointed at an API never mocks by accident.
 */
export const mocksEnabled = env.VITE_ENABLE_MOCKS ?? !env.VITE_API_URL;

/** The mock API answers on the app's own origin, under /api. */
export const apiBaseUrl =
  env.VITE_API_URL ??
  (mocksEnabled ? `${window.location.origin}/api` : undefined);
