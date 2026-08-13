"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isApiError } from "@/lib/api/api-error";

import type { AdminUser } from "../types/admin-user.types";

type ChangeUserStatusDialogProps = {
  trigger: ReactElement;
  user: AdminUser;
  isPending: boolean;
  onConfirm: () => Promise<void>;
};

export function ChangeUserStatusDialog({
  trigger,
  user,
  isPending,
  onConfirm,
}: ChangeUserStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextStatusLabel = user.isActive ? "Deactivate" : "Activate";
  const nextStateText = user.isActive ? "inactive" : "active";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setError(null);
        }
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangleIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{nextStatusLabel} user</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark {user.name} as {nextStateText}. Backend safeguards
            still prevent self-deactivation and last-admin lockout.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to change status</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            type="button"
            variant={user.isActive ? "destructive" : "default"}
            onClick={async (event) => {
              event.preventDefault();
              setError(null);

              try {
                await onConfirm();
                setOpen(false);
              } catch (confirmError) {
                setError(
                  isApiError(confirmError)
                    ? confirmError.message
                    : "Unable to change this user's status. Please try again.",
                );
              }
            }}
          >
            {isPending ? "Saving..." : nextStatusLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
