import { ROUTES } from "@/features/auth/utils/auth-redirects";
import { PERMISSIONS } from "@/permissions/permissions";

import type { RoleNavigationMap } from "./navigation.types";

export const ROLE_NAVIGATION = {
  EMPLOYEE: [
    {
      label: "Dashboard",
      href: ROUTES.EMPLOYEE_DASHBOARD,
    },
    {
      label: "My Requests",
      href: "/employee/requests",
      requiredPermissions: [PERMISSIONS.REQUEST_READ_OWN],
    },
    {
      label: "New Request",
      href: "/employee/requests/new",
      requiredPermissions: [PERMISSIONS.REQUEST_CREATE],
    },
    {
      label: "Profile",
      href: "/employee/profile",
    },
  ],
  MANAGER: [
    {
      label: "Dashboard",
      href: ROUTES.MANAGER_DASHBOARD,
    },
    {
      label: "Team Requests",
      href: "/manager/requests",
      requiredPermissions: [PERMISSIONS.REQUEST_READ_TEAM],
    },
    {
      label: "Approvals",
      href: "/manager/approvals",
      requiredPermissions: [PERMISSIONS.REQUEST_APPROVE],
    },
  ],
  ADMIN: [
    {
      label: "Dashboard",
      href: ROUTES.ADMIN_DASHBOARD,
    },
    {
      label: "Requests",
      href: "/admin/requests",
      requiredPermissions: [PERMISSIONS.REQUEST_READ_ALL],
    },
    {
      label: "Users",
      href: "/admin/users",
      requiredPermissions: [PERMISSIONS.USER_READ],
    },
    {
      label: "Audit Logs",
      href: "/admin/audit-logs",
      requiredPermissions: [PERMISSIONS.AUDIT_READ],
    },
  ],
} as const satisfies RoleNavigationMap;
