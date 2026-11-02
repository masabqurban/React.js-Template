import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, initials } from "@/lib/format";

import { userQueryOptions } from "../api/users.queries";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserRoleBadge, UserStatusBadge } from "./user-badges";
import { UserFormDialog } from "./user-form-dialog";

export function UserDetailPage({
  userId,
  onDeleted,
}: {
  userId: string;
  onDeleted: () => void;
}) {
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fields = [
    { label: "Email", value: user.email },
    { label: "Role", value: <UserRoleBadge role={user.role} /> },
    { label: "Status", value: <UserStatusBadge status={user.status} /> },
    { label: "Joined", value: formatDate(user.createdAt) },
    {
      label: "Last active",
      value: user.lastActiveAt ? formatDate(user.lastActiveAt) : "Never",
    },
    {
      label: "User ID",
      value: <span className="font-mono text-xs">{user.id}</span>,
    },
  ];

  return (
    <div className="grid gap-6 *:min-w-0">
      <Button variant="link" asChild className="h-auto justify-self-start p-0">
        <Link to="/users">
          <ArrowLeft aria-hidden />
          All users
        </Link>
      </Button>

      <PageHeader
        title={user.name}
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil aria-hidden />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleting(true)}>
              <Trash2 aria-hidden />
              Delete
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row">
          <span
            aria-hidden
            className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xl font-bold text-link"
          >
            {initials(user.name)}
          </span>
          <dl className="grid flex-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="grid gap-1">
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {field.label}
                </dt>
                <dd className="text-sm">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <UserFormDialog open={editing} onOpenChange={setEditing} user={user} />
      <DeleteUserDialog
        user={deleting ? user : null}
        onOpenChange={setDeleting}
        onDeleted={onDeleted}
      />
    </div>
  );
}
