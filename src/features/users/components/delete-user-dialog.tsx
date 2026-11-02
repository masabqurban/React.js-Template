import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

import { useDeleteUser } from "../api/users.queries";
import type { User } from "../schemas/user.schema";

type DeleteUserDialogProps = {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

/** Destructive actions always ask first, and name exactly what will be deleted. */
export function DeleteUserDialog({
  user,
  onOpenChange,
  onDeleted,
}: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent
        role="alertdialog"
        title="Delete user?"
        description={
          user ? (
            <>
              <span className="font-semibold text-foreground">{user.name}</span>{" "}
              will lose access immediately. This can&apos;t be undone.
            </>
          ) : null
        }
      >
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={() => {
              if (!user) return;
              deleteUser.mutate(user, {
                onSuccess: () => {
                  onOpenChange(false);
                  onDeleted?.();
                },
              });
            }}
          >
            {deleteUser.isPending ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : null}
            Delete user
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
