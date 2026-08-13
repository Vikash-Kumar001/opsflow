import type { AuthUser, Role } from "../types/auth.types";

export const ROUTES = {
  LOGIN: "/login",
  FORBIDDEN: "/forbidden",
  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  MANAGER_DASHBOARD: "/manager/dashboard",
  EMPLOYEE_DASHBOARD: "/employee/dashboard",
} as const;

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: ROUTES.ADMIN_DASHBOARD,
  MANAGER: ROUTES.MANAGER_DASHBOARD,
  EMPLOYEE: ROUTES.EMPLOYEE_DASHBOARD,
};

export function getRoleLandingPath(role: Role): string {
  return ROLE_HOME[role];
}

export function getSafeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const baseUrl = "https://opsflow.local";
    const url = new URL(value, baseUrl);

    if (url.origin !== baseUrl || url.pathname === ROUTES.LOGIN) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function canRoleAccessPath(role: Role, path: string): boolean {
  if (path.startsWith("/admin")) {
    return role === "ADMIN";
  }

  if (path.startsWith("/manager")) {
    return role === "MANAGER";
  }

  if (path.startsWith("/employee")) {
    return role === "EMPLOYEE";
  }

  return true;
}

export function resolvePostLoginRedirect(
  user: Pick<AuthUser, "role">,
  returnTo: string | null,
): string {
  const safeReturnTo = getSafeReturnTo(returnTo);

  if (safeReturnTo && canRoleAccessPath(user.role, safeReturnTo)) {
    return safeReturnTo;
  }

  return getRoleLandingPath(user.role);
}

export function buildLoginPath(returnTo: string): string {
  const safeReturnTo = getSafeReturnTo(returnTo);

  if (!safeReturnTo) {
    return ROUTES.LOGIN;
  }

  return `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(safeReturnTo)}`;
}
