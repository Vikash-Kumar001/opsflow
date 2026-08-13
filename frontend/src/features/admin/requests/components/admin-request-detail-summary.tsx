import { format } from "date-fns";

import { UserSummary } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RequestCategoryBadge,
  RequestMetadataList,
  RequestPriorityBadge,
  RequestStatusBadge,
  type RequestSummary,
} from "@/features/shared/requests";

type AdminRequestDetailSummaryProps = {
  request: RequestSummary;
};

export function AdminRequestDetailSummary({
  request,
}: AdminRequestDetailSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground">
                {request.requestNumber}
              </p>
              <CardTitle className="text-xl">{request.title}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <RequestStatusBadge value={request.status} />
              <RequestPriorityBadge value={request.priority} />
              <RequestCategoryBadge value={request.category} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
            {request.description}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Requester
              </p>
              <UserSummary user={request.createdBy} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Reviewer
              </p>
              {request.reviewedBy ? (
                <UserSummary user={request.reviewedBy} />
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        <RequestMetadataList
          items={[
            { label: "Created", value: formatDateTime(request.createdAt) },
            { label: "Updated", value: formatDateTime(request.updatedAt) },
            { label: "Submitted", value: formatDateTime(request.submittedAt) },
            { label: "Reviewed", value: formatDateTime(request.reviewedAt) },
            { label: "Archived", value: formatDateTime(request.deletedAt) },
            { label: "Review notes", value: request.reviewNotes },
            { label: "Rejection reason", value: request.rejectionReason },
          ]}
        />
      </div>
    </div>
  );
}

function formatDateTime(value: string | null): string | null {
  return value ? format(new Date(value), "MMM d, yyyy h:mm a") : null;
}
