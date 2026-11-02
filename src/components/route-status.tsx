import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/config/env";
import { isApiError } from "@/lib/api";

/** Shown while a route's code or loader data is loading (after a short delay). */
export function RoutePending() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

/** Route-level error boundary: one failing screen never takes down the whole app. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const message =
    isApiError(error) && error.isNotFound
      ? "We couldn't find what you were looking for."
      : "This is usually temporary. Please try again.";

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 py-20 text-center"
    >
      <title>{`Error | ${env.VITE_APP_NAME}`}</title>
      <AlertTriangle aria-hidden className="size-8 text-warning" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" asChild>
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export function RouteNotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[60svh] flex-col items-center justify-center gap-4 p-10 text-center"
    >
      <title>{`Page not found | ${env.VITE_APP_NAME}`}</title>
      <p className="text-sm font-semibold text-link">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </main>
  );
}
