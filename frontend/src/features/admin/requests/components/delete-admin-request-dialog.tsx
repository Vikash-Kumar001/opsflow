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
import type { RequestSummary } from "@/features/shared/requests";
import { isApiError } from "@/lib/api/api-error";

type DeleteAdminRequestDialogProps = {
  trigger: ReactElement;
  request: RequestSummary;
  isPending: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteAdminRequestDialog({
  trigger,
  request,
  isPending,
  onConfirm,
}: DeleteAdminRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <AlertDialogTitle>Archive request</AlertDialogTitle>
          <AlertDialogDescription>
            This will soft delete {request.requestNumber}. Comments and audit
            history are preserved by the backend.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to archive request</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            type="button"
            variant="destructive"
            onClick={async (event) => {
              event.preventDefault();
              setError(null);

              try {
                await onConfirm();
                setOpen(false);
              } catch (deleteError) {
                setError(
                  isApiError(deleteError)
                    ? deleteError.message
                    : "Unable to archive this request. Please try again.",
                );
              }
            }}
          >
            {isPending ? "Archiving..." : "Archive request"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
