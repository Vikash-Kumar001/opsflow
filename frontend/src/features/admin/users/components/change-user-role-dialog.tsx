"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { isApiError } from "@/lib/api/api-error";

import type { AdminUser, AdminUserRole } from "../types/admin-user.types";
import { ADMIN_USER_ROLES } from "../types/admin-user.types";
import { ADMIN_USER_ROLE_LABELS } from "../utils/admin-user-labels";

type ChangeUserRoleDialogProps = {
  trigger: ReactElement;
  user: AdminUser;
  isPending: boolean;
  onSubmit: (role: AdminUserRole) => Promise<void>;
};

export function ChangeUserRoleDialog({
  trigger,
  user,
  isPending,
  onSubmit,
}: ChangeUserRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<AdminUserRole>(user.role);
  const [formError, setFormError] = useState<string | null>(null);
  const roleChanged = role !== user.role;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setRole(user.role);
          setFormError(null);
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setFormError(null);

            try {
              await onSubmit(role);
              setOpen(false);
            } catch (error) {
              setFormError(
                isApiError(error)
                  ? error.message
                  : "Unable to change this user's role. Please try again.",
              );
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Change {user.name} from {ADMIN_USER_ROLE_LABELS[user.role]} to{" "}
              {ADMIN_USER_ROLE_LABELS[role]}.
            </DialogDescription>
          </DialogHeader>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to change role</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Label className="grid gap-2">
            <span>New role</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={role}
              onChange={(event) => setRole(event.target.value as AdminUserRole)}
            >
              {ADMIN_USER_ROLES.map((option) => (
                <option key={option} value={option}>
                  {ADMIN_USER_ROLE_LABELS[option]}
                </option>
              ))}
            </select>
          </Label>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button disabled={isPending || !roleChanged} type="submit">
              {isPending ? "Changing..." : "Change role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
