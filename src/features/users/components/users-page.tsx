import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserX,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { capitalize, formatDate } from "@/lib/format";

import { usersQueryOptions } from "../api/users.queries";
import {
  userRoles,
  userStatuses,
  type User,
  type UserRole,
  type UserStatus,
  type UsersSearch,
} from "../schemas/user.schema";
import { UserRoleBadge, UserStatusBadge } from "./user-badges";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserFormDialog } from "./user-form-dialog";

type UsersPageProps = {
  search: UsersSearch;
  onSearchChange: (patch: Partial<UsersSearch>) => void;
};

/**
 * The list reads all of its state (page, search, filters) from the URL via
 * props, so the route owns navigation and the page stays easy to test.
 */
export function UsersPage({ search, onSearchChange }: UsersPageProps) {
  const { data } = useSuspenseQuery(usersQueryOptions(search));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>();
  const [deleting, setDeleting] = useState<User | null>(null);
  const debouncedSearch = useDebouncedCallback((q: string) =>
    onSearchChange({ q }),
  );

  const openForm = (user?: User) => {
    setEditing(user);
    setFormOpen(true);
  };

  const hasFilters = Boolean(search.q ?? search.role ?? search.status);

  return (
    <div className="grid gap-6 *:min-w-0">
      <PageHeader
        title="Users"
        description="Manage who has access to your workspace."
        actions={
          <Button onClick={() => openForm()}>
            <Plus aria-hidden />
            Add user
          </Button>
        }
      />

      <Card>
        <div
          role="search"
          className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_auto_auto]"
        >
          <div className="relative">
            <Label htmlFor="user-search" className="sr-only">
              Search users
            </Label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="user-search"
              type="search"
              placeholder="Search by name or email…"
              defaultValue={search.q ?? ""}
              onChange={(event) => debouncedSearch(event.target.value)}
              className="ps-9"
            />
          </div>
          <div>
            <Label htmlFor="role-filter" className="sr-only">
              Filter by role
            </Label>
            <NativeSelect
              id="role-filter"
              value={search.role ?? ""}
              onChange={(event) =>
                onSearchChange({
                  role: (event.target.value || undefined) as
                    UserRole | undefined,
                })
              }
            >
              <option value="">All roles</option>
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {capitalize(role)}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="status-filter" className="sr-only">
              Filter by status
            </Label>
            <NativeSelect
              id="status-filter"
              value={search.status ?? ""}
              onChange={(event) =>
                onSearchChange({
                  status: (event.target.value || undefined) as
                    UserStatus | undefined,
                })
              }
            >
              <option value="">All statuses</option>
              {userStatuses.map((status) => (
                <option key={status} value={status}>
                  {capitalize(status)}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {data.data.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No users found"
            description={
              hasFilters
                ? "Try a different search or clear the filters."
                : "Add your first user to get started."
            }
          />
        ) : (
          <Table aria-label="Users">
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <Td>
                    <Link
                      to="/users/$userId"
                      params={{ userId: user.id }}
                      className="font-medium hover:text-link hover:underline"
                    >
                      {user.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </Td>
                  <Td>
                    <UserRoleBadge role={user.role} />
                  </Td>
                  <Td>
                    <UserStatusBadge status={user.status} />
                  </Td>
                  <Td className="text-muted-foreground">
                    <time dateTime={user.createdAt}>
                      {formatDate(user.createdAt)}
                    </time>
                  </Td>
                  <Td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${user.name}`}
                        >
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openForm(user)}>
                          <Pencil aria-hidden />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setDeleting(user)}
                          className="text-destructive [&_svg]:text-destructive"
                        >
                          <Trash2 aria-hidden />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Pagination
          {...data.meta}
          onPageChange={(page) => onSearchChange({ page })}
        />
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
      />
      <DeleteUserDialog
        user={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
