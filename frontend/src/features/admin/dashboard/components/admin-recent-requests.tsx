import { format } from "date-fns";

import { DataTable, EmptyState, type DataTableColumn } from "@/components/shared";
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

type AdminRecentRequestsProps = {
  requests: RequestSummary[];
};

export function AdminRecentRequests({ requests }: AdminRecentRequestsProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-medium text-foreground">
          Recent requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest organization request activity across all roles.
        </p>
      </div>

      <DataTable
        aria-label="Recent organization requests"
        className="hidden md:block"
        columns={columns}
        data={requests}
        getRowKey={(request) => request.id}
        emptyState={
          <EmptyState
            title="No recent requests"
            description="Organization requests will appear here after users create them."
          />
        }
      />

      <div className="grid gap-3 md:hidden">
        {requests.length === 0 ? (
          <EmptyState
            title="No recent requests"
            description="Organization requests will appear here after users create them."
          />
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate">{request.title}</CardTitle>
                    <CardDescription>
                      {request.requestNumber} by {request.createdBy.name}
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
          ))
        )}
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
    id: "requester",
    header: "Requester",
    cell: (request) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {request.createdBy.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {request.createdBy.email}
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
    id: "created",
    header: "Created",
    cell: (request) => format(new Date(request.createdAt), "MMM d, yyyy"),
    className: "hidden lg:table-cell",
  },
];
