import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const fieldStyles =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

/** Native select: accessible, mobile-friendly and zero JavaScript. */
export function NativeSelect({
  className,
  ...props
}: ComponentProps<"select">) {
  return <select className={cn(fieldStyles, "pe-8", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  // eslint-disable-next-line jsx-a11y/label-has-associated-control -- callers pass htmlFor.
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
