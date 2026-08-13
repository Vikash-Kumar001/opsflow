"use client";

import { ArchiveIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ErrorState,
  PageHeader,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { RequestComments } from "@/features/shared/comments";
import { RequestTimeline } from "@/features/shared/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isApiError } from "@/lib/api/api-error";

import { AdminRequestDetailSummary } from "./admin-request-detail-summary";
import { DeleteAdminRequestDialog } from "./delete-admin-request-dialog";
import { useAdminRequest } from "../hooks/use-admin-requests";
import { useDeleteAdminRequest } from "../hooks/use-delete-admin-request";
import { buildAdminRequestTimeline } from "../utils/admin-request-timeline-events";

type AdminRequestDetailProps = {
  requestId: string;
};

export function AdminRequestDetail({ requestId }: AdminRequestDetailProps) {
  const router = useRouter();
  const requestQuery = useAdminRequest(requestId);
  const deleteRequestMutation = useDeleteAdminRequest();
  const [pageError, setPageError] = useState<string | null>(null);

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
          message="This organization request does not exist, was archived, or is unavailable."
          action={
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href="/admin/requests"
            >
              Requests
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
            : "We could not load this organization request."
        }
        onRetry={() => void requestQuery.refetch()}
      />
    );
  }

  const request = requestQuery.data.request;

  async function handleDelete() {
    try {
      await deleteRequestMutation.mutateAsync(request.id);
      router.push("/admin/requests");
    } catch (error) {
      setPageError(
        isApiError(error)
          ? error.message
          : "Unable to archive this request. Please try again.",
      );
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin request oversight"
        title={request.requestNumber}
        description={request.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/admin/requests"
            >
              <ArrowLeft data-icon="inline-start" />
              Requests
            </Link>
            <DeleteAdminRequestDialog
              request={request}
              isPending={deleteRequestMutation.isPending}
              onConfirm={handleDelete}
              trigger={
                <Button type="button" variant="destructive">
                  <ArchiveIcon data-icon="inline-start" />
                  Archive
                </Button>
              }
            />
          </div>
        }
      />

      {pageError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to archive request</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      ) : null}

      <AdminRequestDetailSummary request={request} />

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <RequestTimeline events={buildAdminRequestTimeline(request)} />
        </CardContent>
      </Card>

      <RequestComments
        requestId={request.id}
        emptyDescription="Admin comments can add operational context without changing workflow state."
      />
    </div>
  );
}
