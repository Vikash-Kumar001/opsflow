import type { AuthUser, Role } from "@/features/auth/types/auth.types";

import type { Permission } from "./permission.types";
import { ROLE_PERMISSIONS } from "./role-permissions";

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function can(
  user: Pick<AuthUser, "role"> | null | undefined,
  permission: Permission,
): boolean {
  if (!user) {
    return false;
  }

  return getPermissionsForRole(user.role).includes(permission);
}

export function canAny(
  user: Pick<AuthUser, "role"> | null | undefined,
  permissions: readonly Permission[],
): boolean {
  if (permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => can(user, permission));
}

export function canEvery(
  user: Pick<AuthUser, "role"> | null | undefined,
  permissions: readonly Permission[],
): boolean {
  if (permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) => can(user, permission));
}
