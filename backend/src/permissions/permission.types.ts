import type { UserRole } from "../domain/user/user.types.js";
import type { ALL_PERMISSIONS } from "./permissions.js";

export type Permission = (typeof ALL_PERMISSIONS)[number];

export type RolePermissionMap = Record<UserRole, readonly Permission[]>;
