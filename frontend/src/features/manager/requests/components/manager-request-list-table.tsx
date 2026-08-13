import { format } from "date-fns";

import { DataTable, type DataTableColumn } from "@/components/shared";
import {
  RequestCategoryBadge,
  RequestPriorityBadge,
  RequestStatusBadge,
} from "@/features/shared/requests";

import { ManagerRequestRowActions } from "./manager-request-row-actions";
import type { TeamRequest } from "../types/manager-request-list.types";

type ManagerRequestListTableProps = {
  requests: TeamRequest[];
  label: string;
};

export function ManagerRequestListTable({
  requests,
  label,
}: ManagerRequestListTableProps) {
  return (
    <DataTable
      aria-label={label}
      className="hidden md:block"
      columns={columns}
      data={requests}
      getRowKey={(request) => request.id}
    />
  );
}

const columns: Array<DataTableColumn<TeamRequest>> = [
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
    id: "submitted",
    header: "Submitted",
    cell: (request) =>
      request.submittedAt
        ? format(new Date(request.submittedAt), "MMM d, yyyy")
        : "Not submitted",
    className: "hidden xl:table-cell",
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    cell: (request) => <ManagerRequestRowActions request={request} />,
    className: "text-right",
  },
];
