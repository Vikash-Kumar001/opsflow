import { format } from "date-fns";

import {
  DataTable,
  UserSummary,
  type DataTableColumn,
} from "@/components/shared";
import {
  RequestCategoryBadge,
  RequestPriorityBadge,
  RequestStatusBadge,
  type RequestSummary,
} from "@/features/shared/requests";

import { AdminRequestRowActions } from "./admin-request-row-actions";

type AdminRequestListTableProps = {
  requests: RequestSummary[];
  isDeletePending: boolean;
  onDelete: (request: RequestSummary) => Promise<void>;
};

export function AdminRequestListTable({
  requests,
  isDeletePending,
  onDelete,
}: AdminRequestListTableProps) {
  const columns = buildColumns({ isDeletePending, onDelete });

  return (
    <DataTable
      aria-label="Organization requests"
      className="hidden md:block"
      columns={columns}
      data={requests}
      getRowKey={(request) => request.id}
    />
  );
}

type BuildColumnsOptions = Pick<
  AdminRequestListTableProps,
  "isDeletePending" | "onDelete"
>;

function buildColumns({
  isDeletePending,
  onDelete,
}: BuildColumnsOptions): Array<DataTableColumn<RequestSummary>> {
  return [
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
      cell: (request) => <UserSummary user={request.createdBy} />,
    },
    {
      id: "reviewer",
      header: "Reviewer",
      cell: (request) =>
        request.reviewedBy ? (
          <UserSummary user={request.reviewedBy} />
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        ),
      className: "hidden xl:table-cell",
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
      id: "category",
      header: "Category",
      cell: (request) => <RequestCategoryBadge value={request.category} />,
      className: "hidden xl:table-cell",
    },
    {
      id: "created",
      header: "Created",
      cell: (request) => format(new Date(request.createdAt), "MMM d, yyyy"),
      className: "hidden lg:table-cell",
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (request) => (
        <AdminRequestRowActions
          request={request}
          isDeletePending={isDeletePending}
          onDelete={onDelete}
        />
      ),
      className: "text-right",
    },
  ];
}
