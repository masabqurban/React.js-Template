import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { env } from "@/config/env";
import { LoginForm } from "@/features/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(undefined),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) {
      throw redirect({ href: safeRedirectPath(search.redirect) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const router = useRouter();

  return (
    <main
      id="main"
      className="relative flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/50 p-4"
    >
      <title>{`Sign in | ${env.VITE_APP_NAME}`}</title>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Logo />
      <LoginForm
        onSuccess={() => {
          // Re-run guards with the new session, then continue where the user was going.
          void router
            .invalidate()
            .then(() => router.history.push(safeRedirectPath(redirectTo)));
        }}
      />
    </main>
  );
}
