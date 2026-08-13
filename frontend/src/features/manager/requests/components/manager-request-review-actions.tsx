"use client";

import { CheckCircle2, PlayCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/api-error";

import {
  useApproveTeamRequest,
  useRejectTeamRequest,
  useStartTeamRequestReview,
} from "../hooks/use-manager-review-actions";
import type {
  ManagerRejectRequestPayload,
  ManagerReviewNotesPayload,
  TeamRequest,
} from "../types/manager-request-list.types";
import { RejectRequestDialog } from "./reject-request-dialog";
import { ReviewNotesDialog } from "./review-notes-dialog";

type ManagerRequestReviewActionsProps = {
  request: TeamRequest;
  isSelfRequest: boolean;
  onConflict: (message: string) => void;
};

export function ManagerRequestReviewActions({
  request,
  isSelfRequest,
  onConflict,
}: ManagerRequestReviewActionsProps) {
  const startReview = useStartTeamRequestReview();
  const approve = useApproveTeamRequest();
  const reject = useRejectTeamRequest();

  if (isSelfRequest || isTerminalStatus(request.status)) {
    return null;
  }

  const canStartReview = request.status === "PENDING";
  const canDecide = request.status === "PENDING" || request.status === "IN_REVIEW";

  if (!canStartReview && !canDecide) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {canStartReview ? (
        <ReviewNotesDialog
          trigger={
            <Button variant="outline">
              <PlayCircle data-icon="inline-start" />
              Start review
            </Button>
          }
          title="Start review"
          description="Move this request into review and optionally add context for the review record."
          confirmLabel="Start review"
          pendingLabel="Starting..."
          isPending={startReview.isPending}
          onSubmit={(values) =>
            runReviewMutation(
              () =>
                startReview.mutateAsync({
                  requestId: request.id,
                  payload: toReviewPayload(values),
                }),
              onConflict,
            )
          }
        />
      ) : null}

      {canDecide ? (
        <>
          <ReviewNotesDialog
            trigger={
              <Button>
                <CheckCircle2 data-icon="inline-start" />
                Approve
              </Button>
            }
            title="Approve request"
            description="Approve this team request. Optional notes will be saved with the review."
            confirmLabel="Approve request"
            pendingLabel="Approving..."
            isPending={approve.isPending}
            onSubmit={(values) =>
              runReviewMutation(
                () =>
                  approve.mutateAsync({
                    requestId: request.id,
                    payload: toReviewPayload(values),
                  }),
                onConflict,
              )
            }
          />
          <RejectRequestDialog
            trigger={
              <Button variant="destructive">
                <XCircle data-icon="inline-start" />
                Reject
              </Button>
            }
            isPending={reject.isPending}
            onSubmit={(values) =>
              runReviewMutation(
                () =>
                  reject.mutateAsync({
                    requestId: request.id,
                    payload: toRejectPayload(values),
                  }),
                onConflict,
              )
            }
          />
        </>
      ) : null}
    </div>
  );
}

async function runReviewMutation(
  mutate: () => Promise<unknown>,
  onConflict: (message: string) => void,
) {
  try {
    await mutate();
  } catch (error) {
    if (isApiError(error) && error.status === 409) {
      onConflict(
        "This request changed while you were reviewing it. The latest state has been loaded.",
      );
    }

    throw error;
  }
}

function toReviewPayload(values: ManagerReviewNotesPayload) {
  return values.reviewNotes ? { reviewNotes: values.reviewNotes } : {};
}

function toRejectPayload(values: ManagerRejectRequestPayload) {
  return {
    rejectionReason: values.rejectionReason,
    ...(values.reviewNotes ? { reviewNotes: values.reviewNotes } : {}),
  };
}

function isTerminalStatus(status: TeamRequest["status"]) {
  return status === "APPROVED" || status === "REJECTED" || status === "CANCELLED";
}
