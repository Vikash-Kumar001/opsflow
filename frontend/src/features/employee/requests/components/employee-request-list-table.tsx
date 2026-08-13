import { format } from "date-fns";

import { DataTable, type DataTableColumn } from "@/components/shared";
import {
  RequestCategoryBadge,
  RequestPriorityBadge,
  RequestStatusBadge,
  type RequestSummary,
} from "@/features/shared/requests";

import { EmployeeRequestRowActions } from "./employee-request-row-actions";

type EmployeeRequestListTableProps = {
  requests: RequestSummary[];
};

export function EmployeeRequestListTable({
  requests,
}: EmployeeRequestListTableProps) {
  return (
    <DataTable
      aria-label="My requests"
      className="hidden md:block"
      columns={columns}
      data={requests}
      getRowKey={(request) => request.id}
    />
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
    className: "hidden lg:table-cell",
  },
  {
    id: "priority",
    header: "Priority",
    cell: (request) => <RequestPriorityBadge value={request.priority} />,
  },
  {
    id: "updated",
    header: "Updated",
    cell: (request) => format(new Date(request.updatedAt), "MMM d, yyyy"),
    className: "hidden xl:table-cell",
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    cell: (request) => <EmployeeRequestRowActions request={request} />,
    className: "text-right",
  },
];
