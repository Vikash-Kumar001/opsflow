import { format } from "date-fns";

import { UserSummary } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RequestCategoryBadge,
  RequestMetadataList,
  RequestPriorityBadge,
  RequestStatusBadge,
} from "@/features/shared/requests";

import type { TeamRequest } from "../types/manager-request-list.types";

type ManagerRequestDetailSummaryProps = {
  request: TeamRequest;
};

export function ManagerRequestDetailSummary({
  request,
}: ManagerRequestDetailSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-xs text-muted-foreground">
                {request.requestNumber}
              </p>
              <CardTitle className="break-words text-xl">
                {request.title}
              </CardTitle>
              <CardDescription>Submitted by {request.requester.name}</CardDescription>
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
            <CardTitle className="text-base">Requester</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSummary user={request.requester} />
          </CardContent>
        </Card>

        <RequestMetadataList
          items={[
            { label: "Created", value: formatDateTime(request.createdAt) },
            { label: "Updated", value: formatDateTime(request.updatedAt) },
            { label: "Submitted", value: formatDateTime(request.submittedAt) },
            { label: "Reviewed", value: formatDateTime(request.reviewedAt) },
            { label: "Reviewer", value: request.reviewer?.name },
          ]}
        />
      </div>
    </div>
  );
}

function formatDateTime(value: string | null): string | null {
  return value ? format(new Date(value), "MMM d, yyyy h:mm a") : null;
}
