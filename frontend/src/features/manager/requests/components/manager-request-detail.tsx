"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  ErrorState,
  PageHeader,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { RequestComments } from "@/features/shared/comments";
import { RequestTimeline } from "@/features/shared/requests";
import { isApiError } from "@/lib/api/api-error";

import { useManagerTeamRequest } from "../hooks/use-manager-team-requests";
import { buildManagerRequestTimeline } from "../utils/manager-request-timeline-events";
import { ManagerRequestDetailSummary } from "./manager-request-detail-summary";
import { ManagerRequestReviewActions } from "./manager-request-review-actions";
import { ManagerRequestReviewContext } from "./manager-request-review-context";

type ManagerRequestDetailProps = {
  requestId: string;
};

export function ManagerRequestDetail({ requestId }: ManagerRequestDetailProps) {
  const requestQuery = useManagerTeamRequest(requestId);
  const currentUserQuery = useCurrentUser();
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  if (requestQuery.isLoading || currentUserQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    const error = requestQuery.error;

    if (isApiError(error) && error.status === 404) {
      return (
        <ErrorState
          title="Request not found"
          message="This team request does not exist, was removed, or is private."
          action={
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href="/manager/requests"
            >
              Team requests
            </Link>
          }
        />
      );
    }

    return (
      <ErrorState
        title="Request unavailable"
        message={
          isApiError(error)
            ? error.message
            : "We could not load this team request."
        }
        onRetry={() => void requestQuery.refetch()}
      />
    );
  }

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return (
      <ErrorState
        title="Session unavailable"
        message="We could not confirm your manager session."
        onRetry={() => void currentUserQuery.refetch()}
      />
    );
  }

  const request = requestQuery.data.request;
  const isSelfRequest = currentUserQuery.data.id === request.requester.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manager review"
        title={request.requestNumber}
        description={request.title}
        actions={
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/manager/approvals"
          >
            <ArrowLeft data-icon="inline-start" />
            Approval queue
          </Link>
        }
      />

      {conflictMessage ? (
        <Alert>
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Request state refreshed</AlertTitle>
          <AlertDescription>{conflictMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isSelfRequest ? (
        <Alert>
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Requester-owned request</AlertTitle>
          <AlertDescription>
            Approval actions are hidden because managers cannot review their own
            requests.
          </AlertDescription>
        </Alert>
      ) : null}

      <ManagerRequestReviewActions
        request={request}
        isSelfRequest={isSelfRequest}
        onConflict={(message) => {
          setConflictMessage(message);
          void requestQuery.refetch();
        }}
      />

      <ManagerRequestDetailSummary request={request} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestTimeline events={buildManagerRequestTimeline(request)} />
          </CardContent>
        </Card>

        <ManagerRequestReviewContext request={request} />
      </div>

      <RequestComments
        requestId={request.id}
        emptyDescription="Add review context or follow-up notes for this team request."
      />
    </div>
  );
}
