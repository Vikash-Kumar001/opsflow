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
  type RequestSummary,
} from "@/features/shared/requests";

type EmployeeRecentRequestsProps = {
  requests: RequestSummary[];
};

export function EmployeeRecentRequests({
  requests,
}: EmployeeRecentRequestsProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Recent requests
          </h2>
          <p className="text-sm text-muted-foreground">
            The latest activity from your own request history.
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/employee/requests"
        >
          View all
        </Link>
      </div>

      <DataTable
        aria-label="Recent employee requests"
        className="hidden md:block"
        columns={columns}
        data={requests}
        getRowKey={(request) => request.id}
        emptyState={
          <EmptyState
            title="No requests yet"
            description="Create your first request to start tracking approvals from this dashboard."
            action={
              <Link
                className={buttonVariants()}
                href="/employee/requests/new"
              >
                New request
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
                  <CardDescription>{request.requestNumber}</CardDescription>
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

const columns: Array<DataTableColumn<RequestSummary>> = [
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
    id: "status",
    header: "Status",
    cell: (request) => <RequestStatusBadge value={request.status} />,
  },
  {
    id: "category",
    header: "Category",
    cell: (request) => <RequestCategoryBadge value={request.category} />,
    className: "hidden md:table-cell",
  },
  {
    id: "priority",
    header: "Priority",
    cell: (request) => <RequestPriorityBadge value={request.priority} />,
    className: "hidden lg:table-cell",
  },
  {
    id: "updated",
    header: "Updated",
    cell: (request) => format(new Date(request.updatedAt), "MMM d, yyyy"),
    className: "hidden lg:table-cell",
  },
];
