import { describe, expect, it } from "vitest";

import { can, canEvery } from "@/permissions/can";
import { PERMISSIONS } from "@/permissions/permissions";
import { getVisibleNavigation } from "@/navigation/navigation.service";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { canRoleAccessPath } from "@/features/auth/utils/auth-redirects";

const baseUser: AuthUser = {
  id: "user-1",
  name: "Demo User",
  email: "demo@opsflow.demo",
  role: "EMPLOYEE",
  isActive: true,
  managerId: null,
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("frontend permission model", () => {
  it("denies missing users and empty all-of checks by default", () => {
    expect(can(null, PERMISSIONS.REQUEST_CREATE)).toBe(false);
    expect(canEvery(baseUser, [])).toBe(false);
  });

  it("filters navigation through centralized permissions", () => {
    expect(getVisibleNavigation(baseUser).map((item) => item.label)).toEqual([
      "Dashboard",
      "My Requests",
      "New Request",
      "Profile",
    ]);

    expect(
      getVisibleNavigation({ ...baseUser, role: "ADMIN" }).map(
        (item) => item.label,
      ),
    ).toEqual(["Dashboard", "Requests", "Users", "Audit Logs"]);
  });

  it("blocks manual role-area navigation outside the current role", () => {
    expect(canRoleAccessPath("EMPLOYEE", "/admin/dashboard")).toBe(false);
    expect(canRoleAccessPath("MANAGER", "/admin/users")).toBe(false);
    expect(canRoleAccessPath("ADMIN", "/admin/users")).toBe(true);
  });
});
