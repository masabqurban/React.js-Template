import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Monitor, Moon, Sun } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  profileSchema,
  sessionStore,
  updateMe,
  type ProfileValues,
  type SessionUser,
} from "@/features/auth";
import { isApiError } from "@/lib/api";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function ProfileCard({ user }: { user: SessionUser }) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  });
  const save = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      sessionStore.setUser(updated);
      form.reset({ name: updated.name, email: updated.email });
      toast.success("Profile updated.");
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "EMAIL_TAKEN") {
        form.setError("email", { message: error.message });
      } else {
        toast.error(error.message);
      }
    },
  });
  const { errors, isDirty } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how others see you in the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
          noValidate
          className="grid max-w-md gap-4"
        >
          <FormField label="Full name" error={errors.name?.message}>
            <Input autoComplete="name" {...form.register("name")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
          </FormField>
          <Button
            type="submit"
            className="justify-self-start"
            disabled={!isDirty || save.isPending}
          >
            {save.isPending ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : null}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose a theme, or follow your operating system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset>
          <legend className="sr-only">Theme</legend>
          <div className="grid max-w-md grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border p-4 text-sm font-medium transition-colors hover:bg-muted has-focus-visible:outline-2 has-focus-visible:outline-ring",
                  theme === value && "border-primary bg-primary-soft text-link",
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => setTheme(value)}
                  className="sr-only"
                />
                <Icon aria-hidden className="size-5" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}

export function SettingsPage({ user }: { user: SessionUser }) {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences."
      />
      <ProfileCard user={user} />
      <AppearanceCard />
    </div>
  );
}
