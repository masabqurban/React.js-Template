import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { env, mocksEnabled } from "@/config/env";

import { login } from "../api/auth.api";
import { loginErrorMessage } from "../lib/login-error";
import {
  loginSchema,
  type LoginInput,
  type LoginValues,
} from "../schemas/auth.schema";
import { sessionStore } from "../session-store";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: LoginValues) => {
    setFormError(null);
    try {
      sessionStore.setUser(await login(values));
      onSuccess();
    } catch (error) {
      setFormError(loginErrorMessage(error));
      form.resetField("password");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <CardDescription>Welcome back to {env.VITE_APP_NAME}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="grid gap-4"
        >
          {formError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
              {formError}
            </p>
          ) : null}

          <FormField label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="username"
              inputMode="email"
              disabled={isSubmitting}
              {...form.register("email")}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...form.register("password")}
            />
          </FormField>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : null}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>

          {mocksEnabled ? (
            <p className="rounded-lg bg-muted px-3 py-2.5 text-center text-xs text-muted-foreground">
              Demo account: <span className="font-mono">demo@example.com</span>{" "}
              / <span className="font-mono">password123</span>
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
