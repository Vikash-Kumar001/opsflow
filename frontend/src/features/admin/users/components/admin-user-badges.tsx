import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminUserRole } from "../types/admin-user.types";
import { ADMIN_USER_ROLE_LABELS } from "../utils/admin-user-labels";

type AdminUserRoleBadgeProps = {
  value: AdminUserRole;
  className?: string;
};

type AdminUserStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function AdminUserRoleBadge({
  value,
  className,
}: AdminUserRoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", roleClassName[value], className)}
    >
      {ADMIN_USER_ROLE_LABELS[value]}
    </Badge>
  );
}

export function AdminUserStatusBadge({
  isActive,
  className,
}: AdminUserStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

const roleClassName = {
  ADMIN: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  MANAGER: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  EMPLOYEE:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
} as const satisfies Record<AdminUserRole, string>;
