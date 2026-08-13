import { format } from "date-fns";

import { UserSummary } from "@/components/shared";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { AdminUserRoleBadge, AdminUserStatusBadge } from "./admin-user-badges";
import { AdminUserRowActions } from "./admin-user-row-actions";
import type { AdminUser, AdminUserRole } from "../types/admin-user.types";

type AdminUserListCardsProps = {
  users: AdminUser[];
  isRolePending: boolean;
  isStatusPending: boolean;
  onChangeRole: (user: AdminUser, role: AdminUserRole) => Promise<void>;
  onChangeStatus: (user: AdminUser) => Promise<void>;
};

export function AdminUserListCards({
  users,
  isRolePending,
  isStatusPending,
  onChangeRole,
  onChangeStatus,
}: AdminUserListCardsProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <UserSummary
                user={{ name: user.name, email: user.email, role: user.role }}
              />
              <AdminUserStatusBadge isActive={user.isActive} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <AdminUserRoleBadge value={user.role} />
              <span className="text-xs text-muted-foreground">
                Created {format(new Date(user.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <AdminUserRowActions
              user={user}
              isRolePending={isRolePending}
              isStatusPending={isStatusPending}
              onChangeRole={onChangeRole}
              onChangeStatus={onChangeStatus}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
