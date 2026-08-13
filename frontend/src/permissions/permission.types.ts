import type { Role } from "@/features/auth/types/auth.types";

import type { ALL_PERMISSIONS } from "./permissions";

export type Permission = (typeof ALL_PERMISSIONS)[number];

export type RolePermissionMap = Record<Role, readonly Permission[]>;
