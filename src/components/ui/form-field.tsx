import { useId, type ReactElement, type ReactNode } from "react";
import { Slot } from "radix-ui";

import { Label } from "./input";

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** A single input element. Its id, aria-invalid and aria-describedby are wired up here. */
  children: ReactElement;
};

/** Label, control, hint and error message, connected for assistive technology. */
export function FormField({ label, error, hint, children }: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Slot.Root
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {children}
      </Slot.Root>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
