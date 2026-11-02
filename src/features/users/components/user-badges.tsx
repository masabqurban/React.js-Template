import { Badge } from "@/components/ui/badge";

import type { UserRole, UserStatus } from "../schemas/user.schema";

const statusTone = {
  active: "success",
  invited: "warning",
  suspended: "danger",
} as const satisfies Record<UserStatus, string>;

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge tone={statusTone[status]}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={role === "admin" ? "primary" : "neutral"}>{role}</Badge>;
}
