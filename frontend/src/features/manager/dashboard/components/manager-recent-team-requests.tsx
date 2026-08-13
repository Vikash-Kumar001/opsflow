import Link from "next/link";
import { format } from "date-fns";

import { DataTable, EmptyState, type DataTableColumn } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
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

import type { TeamDashboardRequest } from "../types/manager-dashboard.types";

type ManagerRecentTeamRequestsProps = {
  requests: TeamDashboardRequest[];
};

export function ManagerRecentTeamRequests({
  requests,
}: ManagerRecentTeamRequestsProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Recent team requests
          </h2>
          <p className="text-sm text-muted-foreground">
            The latest review activity from your direct reports.
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/manager/approvals"
        >
          Approval queue
        </Link>
      </div>

      <DataTable
        aria-label="Recent manager team requests"
        className="hidden md:block"
        columns={columns}
        data={requests}
        getRowKey={(request) => request.id}
        emptyState={
          <EmptyState
            title="No team requests yet"
            description="Requests from your direct reports will appear here when they are submitted."
            action={
              <Link
                className={buttonVariants({ variant: "outline" })}
                href="/manager/requests"
              >
                Team requests
              </Link>
            }
          />
        }
      />

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
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

const columns: Array<DataTableColumn<TeamDashboardRequest>> = [
  {
    id: "request",
    header: "Request",
    cell: (request) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{request.title}</p>
        <p className="text-xs text-muted-foreground">
          {request.requestNumber}
        </p>
      </div>
    ),
  },
  {
    id: "requester",
    header: "Requester",
    cell: (request) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {request.requester.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {request.requester.email}
        </p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (request) => <RequestStatusBadge value={request.status} />,
  },
  {
    id: "priority",
    header: "Priority",
    cell: (request) => <RequestPriorityBadge value={request.priority} />,
    className: "hidden lg:table-cell",
  },
  {
    id: "submitted",
    header: "Submitted",
    cell: (request) =>
      request.submittedAt
        ? format(new Date(request.submittedAt), "MMM d, yyyy")
        : "Not submitted",
    className: "hidden lg:table-cell",
  },
];
