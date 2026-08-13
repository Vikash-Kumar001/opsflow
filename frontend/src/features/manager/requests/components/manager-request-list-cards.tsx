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
} from "@/features/shared/requests";

import { ManagerRequestRowActions } from "./manager-request-row-actions";
import type { TeamRequest } from "../types/manager-request-list.types";

type ManagerRequestListCardsProps = {
  requests: TeamRequest[];
};

export function ManagerRequestListCards({
  requests,
}: ManagerRequestListCardsProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CardTitle className="truncate">{request.title}</CardTitle>
                <CardDescription>
                  {request.requestNumber} by {request.requester.name}
                </CardDescription>
              </div>
              <RequestStatusBadge value={request.status} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <RequestCategoryBadge value={request.category} />
              <RequestPriorityBadge value={request.priority} />
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              Submitted{" "}
              {request.submittedAt
                ? format(new Date(request.submittedAt), "MMM d, yyyy")
                : "not yet"}
            </p>
            <ManagerRequestRowActions request={request} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
