"use client";

import { ShieldCheckIcon, UserCheckIcon, UserCogIcon, UserXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ChangeUserRoleDialog } from "./change-user-role-dialog";
import { ChangeUserStatusDialog } from "./change-user-status-dialog";
import type { AdminUser, AdminUserRole } from "../types/admin-user.types";

type AdminUserRowActionsProps = {
  user: AdminUser;
  isRolePending: boolean;
  isStatusPending: boolean;
  onChangeRole: (user: AdminUser, role: AdminUserRole) => Promise<void>;
  onChangeStatus: (user: AdminUser) => Promise<void>;
};

export function AdminUserRowActions({
  user,
  isRolePending,
  isStatusPending,
  onChangeRole,
  onChangeStatus,
}: AdminUserRowActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <ChangeUserRoleDialog
        user={user}
        isPending={isRolePending}
        onSubmit={(role) => onChangeRole(user, role)}
        trigger={
          <Button
            aria-label={`Change role for ${user.email}`}
            size="sm"
            type="button"
            variant="outline"
          >
            {user.role === "ADMIN" ? (
              <ShieldCheckIcon data-icon="inline-start" />
            ) : (
              <UserCogIcon data-icon="inline-start" />
            )}
            Role
          </Button>
        }
      />
      <ChangeUserStatusDialog
        user={user}
        isPending={isStatusPending}
        onConfirm={() => onChangeStatus(user)}
        trigger={
          <Button
            aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.email}`}
            size="sm"
            type="button"
            variant={user.isActive ? "destructive" : "outline"}
          >
            {user.isActive ? (
              <UserXIcon data-icon="inline-start" />
            ) : (
              <UserCheckIcon data-icon="inline-start" />
            )}
            {user.isActive ? "Deactivate" : "Activate"}
          </Button>
        }
      />
    </div>
  );
}
