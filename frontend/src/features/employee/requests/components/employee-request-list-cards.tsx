import { format } from "date-fns";

import {
  Card,
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

import { EmployeeRequestRowActions } from "./employee-request-row-actions";

type EmployeeRequestListCardsProps = {
  requests: RequestSummary[];
};

export function EmployeeRequestListCards({
  requests,
}: EmployeeRequestListCardsProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CardTitle className="truncate">{request.title}</CardTitle>
                <CardDescription>{request.requestNumber}</CardDescription>
              </div>
              <RequestStatusBadge value={request.status} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <RequestCategoryBadge value={request.category} />
              <RequestPriorityBadge value={request.priority} />
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              Updated {format(new Date(request.updatedAt), "MMM d, yyyy")}
            </p>
            <EmployeeRequestRowActions request={request} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
