import type { AuthUser, Role } from "@/features/auth/types/auth.types";
import { canEvery } from "@/permissions/can";

import { ROLE_NAVIGATION } from "./role-navigation";
import type { NavigationItem } from "./navigation.types";

export function getNavigationForRole(role: Role): readonly NavigationItem[] {
  return ROLE_NAVIGATION[role] ?? [];
}

export function getVisibleNavigation(
  user: Pick<AuthUser, "role">,
): readonly NavigationItem[] {
  return getNavigationForRole(user.role).filter((item) => {
    if (!item.requiredPermissions) {
      return true;
    }

    return canEvery(user, item.requiredPermissions);
  });
}
