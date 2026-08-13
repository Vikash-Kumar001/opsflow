import { format } from "date-fns";

import {
  DataTable,
  UserSummary,
  type DataTableColumn,
} from "@/components/shared";

import { AdminUserRoleBadge, AdminUserStatusBadge } from "./admin-user-badges";
import { AdminUserRowActions } from "./admin-user-row-actions";
import type { AdminUser, AdminUserRole } from "../types/admin-user.types";

type AdminUserListTableProps = {
  users: AdminUser[];
  isRolePending: boolean;
  isStatusPending: boolean;
  onChangeRole: (user: AdminUser, role: AdminUserRole) => Promise<void>;
  onChangeStatus: (user: AdminUser) => Promise<void>;
};

export function AdminUserListTable({
  users,
  isRolePending,
  isStatusPending,
  onChangeRole,
  onChangeStatus,
}: AdminUserListTableProps) {
  const columns = buildColumns({
    isRolePending,
    isStatusPending,
    onChangeRole,
    onChangeStatus,
  });

  return (
    <DataTable
      aria-label="Admin users"
      className="hidden md:block"
      columns={columns}
      data={users}
      getRowKey={(user) => user.id}
    />
  );
}

type BuildColumnsOptions = Pick<
  AdminUserListTableProps,
  "isRolePending" | "isStatusPending" | "onChangeRole" | "onChangeStatus"
>;

function buildColumns({
  isRolePending,
  isStatusPending,
  onChangeRole,
  onChangeStatus,
}: BuildColumnsOptions): Array<DataTableColumn<AdminUser>> {
  return [
    {
      id: "user",
      header: "User",
      cell: (user) => (
        <UserSummary
          user={{ name: user.name, email: user.email, role: user.role }}
        />
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => <AdminUserRoleBadge value={user.role} />,
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <AdminUserStatusBadge isActive={user.isActive} />,
    },
    {
      id: "created",
      header: "Created",
      cell: (user) => format(new Date(user.createdAt), "MMM d, yyyy"),
      className: "hidden lg:table-cell",
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (user) => (
        <AdminUserRowActions
          user={user}
          isRolePending={isRolePending}
          isStatusPending={isStatusPending}
          onChangeRole={onChangeRole}
          onChangeStatus={onChangeStatus}
        />
      ),
      className: "text-right",
    },
  ];
}
