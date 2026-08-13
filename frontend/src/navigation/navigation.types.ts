import type { Role } from "@/features/auth/types/auth.types";
import type { Permission } from "@/permissions/permission.types";

export type NavigationItem = {
  label: string;
  href: string;
  requiredPermissions?: readonly Permission[];
};

export type RoleNavigationMap = Record<Role, readonly NavigationItem[]>;
