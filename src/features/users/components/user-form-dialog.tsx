import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input, NativeSelect } from "@/components/ui/input";
import { isApiError } from "@/lib/api";
import { capitalize } from "@/lib/format";

import { useCreateUser, useUpdateUser } from "../api/users.queries";
import {
  userFormSchema,
  userRoles,
  userStatuses,
  type User,
  type UserFormInput,
  type UserFormValues,
} from "../schemas/user.schema";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this user, or create a new one when omitted. */
  user?: User;
};

/** Create or edit a user. Validation runs on the client; conflicts come back from the API. */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={user ? "Edit user" : "Add user"}
        description={
          user
            ? `Update ${user.name}'s details and access.`
            : "Invite a new member to your workspace."
        }
      >
        {/* Keyed so reopening for another user starts from fresh defaults. */}
        <UserForm
          key={user?.id ?? "new"}
          user={user}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function UserForm({ user, onDone }: { user?: User; onDone: () => void }) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const form = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        }
      : { name: "", email: "", role: "viewer", status: "invited" },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: UserFormValues) => {
    try {
      if (user) await updateUser.mutateAsync({ id: user.id, values });
      else await createUser.mutateAsync(values);
      onDone();
    } catch (error) {
      // Show server-side conflicts on the field they belong to.
      if (isApiError(error) && error.code === "EMAIL_TAKEN") {
        form.setError(
          "email",
          { message: error.message },
          { shouldFocus: true },
        );
      } else {
        form.setError("root", {
          message:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      noValidate
      className="grid gap-4"
    >
      {errors.root?.message ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      ) : null}

      <FormField label="Full name" error={errors.name?.message}>
        <Input autoComplete="off" {...form.register("name")} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="off" {...form.register("email")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Role" error={errors.role?.message}>
          <NativeSelect {...form.register("role")}>
            {userRoles.map((role) => (
              <option key={role} value={role}>
                {capitalize(role)}
              </option>
            ))}
          </NativeSelect>
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <NativeSelect {...form.register("status")}>
            {userStatuses.map((status) => (
              <option key={status} value={status}>
                {capitalize(status)}
              </option>
            ))}
          </NativeSelect>
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 aria-hidden className="animate-spin" />
          ) : null}
          {user ? "Save changes" : "Add user"}
        </Button>
      </div>
    </form>
  );
}
