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
  RequestPriorityBadge,
  RequestStatusBadge,
  type RequestSummary,
} from "@/features/shared/requests";

import { AdminRequestRowActions } from "./admin-request-row-actions";

type AdminRequestListCardsProps = {
  requests: RequestSummary[];
  isDeletePending: boolean;
  onDelete: (request: RequestSummary) => Promise<void>;
};

export function AdminRequestListCards({
  requests,
  isDeletePending,
  onDelete,
}: AdminRequestListCardsProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CardTitle className="truncate">{request.title}</CardTitle>
                <CardDescription>
                  {request.requestNumber} created{" "}
                  {format(new Date(request.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </div>
              <RequestStatusBadge value={request.status} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <RequestPriorityBadge value={request.priority} />
              <RequestCategoryBadge value={request.category} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserSummary user={request.createdBy} />
            <AdminRequestRowActions
              request={request}
              isDeletePending={isDeletePending}
              onDelete={onDelete}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
