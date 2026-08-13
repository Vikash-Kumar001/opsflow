import { format } from "date-fns";

import {
  RequestCategoryBadge,
  RequestMetadataList,
  RequestPriorityBadge,
  RequestStatusBadge,
} from "@/features/shared/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestSummary } from "@/features/shared/requests";

type EmployeeRequestDetailSummaryProps = {
  request: RequestSummary;
};

export function EmployeeRequestDetailSummary({
  request,
}: EmployeeRequestDetailSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
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

      <RequestMetadataList
        items={[
          { label: "Requester", value: request.createdBy.name },
          { label: "Created", value: formatDateTime(request.createdAt) },
          { label: "Updated", value: formatDateTime(request.updatedAt) },
          { label: "Submitted", value: formatDateTime(request.submittedAt) },
          { label: "Reviewed", value: formatDateTime(request.reviewedAt) },
          { label: "Reviewer", value: request.reviewedBy?.name },
        ]}
      />
    </div>
  );
}

function formatDateTime(value: string | null): string | null {
  return value ? format(new Date(value), "MMM d, yyyy h:mm a") : null;
}
