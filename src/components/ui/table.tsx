import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    // Scrollable regions must be reachable by keyboard. `relative` keeps
    // absolutely positioned content (e.g. sr-only headers) inside the scroll
    // area; without it, it escapes and widens the whole page on mobile.
    <div
      className="relative overflow-x-auto"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scroll region (WCAG 2.1.1)
      tabIndex={0}
      role="region"
      aria-label="Table"
    >
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-b border-border px-4 py-3 whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}
