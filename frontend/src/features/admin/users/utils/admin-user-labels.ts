import type {
  AdminUserRole,
  AdminUserStatus,
} from "../types/admin-user.types";

export const ADMIN_USER_ROLE_LABELS = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
} as const satisfies Record<AdminUserRole, string>;

export const ADMIN_USER_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
} as const satisfies Record<AdminUserStatus, string>;
