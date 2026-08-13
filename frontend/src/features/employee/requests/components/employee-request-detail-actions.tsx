"use client";

import { AlertCircle, Edit, Send, XCircle } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import type { RequestSummary } from "@/features/shared/requests";
import { isApiError } from "@/lib/api/api-error";

import { useCancelRequest, useSubmitRequest } from "../hooks/use-request-transitions";
import {
  canEmployeeCancelRequest,
  canEmployeeEditRequest,
  canEmployeeSubmitRequest,
} from "../utils/employee-request-actions";
import { RequestTransitionDialog } from "./request-transition-dialog";

type EmployeeRequestDetailActionsProps = {
  request: RequestSummary;
  onConflict: (message: string) => void;
};

export function EmployeeRequestDetailActions({
  request,
  onConflict,
}: EmployeeRequestDetailActionsProps) {
  const submitRequest = useSubmitRequest();
  const cancelRequest = useCancelRequest();
  const actionError = submitRequest.error ?? cancelRequest.error;

  const handleMutationError = (error: unknown) => {
    if (isApiError(error) && error.status === 409) {
      onConflict(
        "This request changed while you were viewing it. We refreshed the latest state below.",
      );
    }
  };

  return (
    <div className="space-y-3">
      {actionError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Action unavailable</AlertTitle>
          <AlertDescription>
            {isApiError(actionError) ? actionError.message : "Please try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {canEmployeeEditRequest(request.status) ? (
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/employee/requests/${request.id}/edit`}
          >
            <Edit data-icon="inline-start" />
            Edit
          </Link>
        ) : null}

        {canEmployeeSubmitRequest(request.status) ? (
          <RequestTransitionDialog
            title={`Submit ${request.requestNumber}?`}
            description="Submitting moves this request to pending review. You can still cancel while it remains pending."
            confirmLabel="Submit request"
            pendingLabel="Submitting..."
            isPending={submitRequest.isPending}
            onConfirm={() =>
              submitRequest.mutate(request.id, {
                onError: handleMutationError,
              })
            }
            trigger={
              <Button disabled={submitRequest.isPending} type="button">
                <Send data-icon="inline-start" />
                Submit
              </Button>
            }
          />
        ) : null}

        {canEmployeeCancelRequest(request.status) ? (
          <RequestTransitionDialog
            title={`Cancel ${request.requestNumber}?`}
            description="Cancelling closes the request and keeps its history for audit and reference."
            confirmLabel="Cancel request"
            pendingLabel="Cancelling..."
            destructive
            isPending={cancelRequest.isPending}
            onConfirm={() =>
              cancelRequest.mutate(request.id, {
                onError: handleMutationError,
              })
            }
            trigger={
              <Button
                disabled={cancelRequest.isPending}
                type="button"
                variant="destructive"
              >
                <XCircle data-icon="inline-start" />
                Cancel
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
