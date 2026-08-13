import type { UserRole } from "../domain/user/user.types.js";
import type { Permission } from "./permission.types.js";
import { ALL_PERMISSIONS } from "./permissions.js";
import { ROLE_PERMISSIONS } from "./role-permissions.js";

const ALL_PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && ALL_PERMISSION_SET.has(value);
}

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasEveryPermission(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  if (permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) => hasPermission(role, permission));
}

export function hasAnyPermission(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  if (permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => hasPermission(role, permission));
}
