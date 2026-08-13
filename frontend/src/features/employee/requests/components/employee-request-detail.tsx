"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ErrorState, PageHeader, PageHeaderSkeleton, TableSkeleton } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestTimeline } from "@/features/shared/requests";
import { isApiError } from "@/lib/api/api-error";

import { useEmployeeRequest } from "../hooks/use-employee-request";
import { EmployeeRequestComments } from "./employee-request-comments";
import { EmployeeRequestDetailActions } from "./employee-request-detail-actions";
import { EmployeeRequestDetailSummary } from "./employee-request-detail-summary";
import { EmployeeRequestReviewResult } from "./employee-request-review-result";
import { buildEmployeeRequestTimeline } from "../utils/request-timeline-events";

type EmployeeRequestDetailProps = {
  requestId: string;
};

export function EmployeeRequestDetail({ requestId }: EmployeeRequestDetailProps) {
  const requestQuery = useEmployeeRequest(requestId);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  if (requestQuery.isLoading) {
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
          message="This request does not exist, was removed, or is private."
          action={
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href="/employee/requests"
            >
              My requests
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
            : "We could not load this request."
        }
        onRetry={() => void requestQuery.refetch()}
      />
    );
  }

  const request = requestQuery.data.request;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee requests"
        title={request.requestNumber}
        description={request.title}
        actions={
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/employee/requests"
          >
            <ArrowLeft data-icon="inline-start" />
            My requests
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

      <EmployeeRequestDetailActions
        request={request}
        onConflict={(message) => {
          setConflictMessage(message);
          void requestQuery.refetch();
        }}
      />
      <EmployeeRequestReviewResult request={request} />
      <EmployeeRequestDetailSummary request={request} />

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <RequestTimeline events={buildEmployeeRequestTimeline(request)} />
        </CardContent>
      </Card>

      <EmployeeRequestComments requestId={request.id} />
    </div>
  );
}
