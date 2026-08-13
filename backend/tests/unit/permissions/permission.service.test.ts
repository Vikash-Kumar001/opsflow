import { describe, expect, it } from "vitest";

import type { UserRole } from "../../../src/domain/user/user.types.js";
import {
  getPermissionsForRole,
  hasAnyPermission,
  hasEveryPermission,
  hasPermission,
  isPermission,
} from "../../../src/permissions/permission.service.js";
import { PERMISSIONS } from "../../../src/permissions/permissions.js";

const roleExpectations: Record<UserRole, Record<string, boolean>> = {
  EMPLOYEE: {
    [PERMISSIONS.REQUEST_CREATE]: true,
    [PERMISSIONS.REQUEST_READ_OWN]: true,
    [PERMISSIONS.REQUEST_READ_TEAM]: false,
    [PERMISSIONS.REQUEST_READ_ALL]: false,
    [PERMISSIONS.REQUEST_UPDATE_OWN]: true,
    [PERMISSIONS.REQUEST_DELETE]: false,
    [PERMISSIONS.REQUEST_SUBMIT]: true,
    [PERMISSIONS.REQUEST_CANCEL]: true,
    [PERMISSIONS.REQUEST_APPROVE]: false,
    [PERMISSIONS.REQUEST_REJECT]: false,
    [PERMISSIONS.COMMENT_CREATE]: true,
    [PERMISSIONS.USER_READ]: false,
    [PERMISSIONS.USER_MANAGE]: false,
    [PERMISSIONS.USER_ROLE_UPDATE]: false,
    [PERMISSIONS.USER_STATUS_UPDATE]: false,
    [PERMISSIONS.AUDIT_READ]: false,
    [PERMISSIONS.ANALYTICS_TEAM]: false,
    [PERMISSIONS.ANALYTICS_ORGANIZATION]: false,
  },
  MANAGER: {
    [PERMISSIONS.REQUEST_CREATE]: true,
    [PERMISSIONS.REQUEST_READ_OWN]: true,
    [PERMISSIONS.REQUEST_READ_TEAM]: true,
    [PERMISSIONS.REQUEST_READ_ALL]: false,
    [PERMISSIONS.REQUEST_UPDATE_OWN]: true,
    [PERMISSIONS.REQUEST_DELETE]: false,
    [PERMISSIONS.REQUEST_SUBMIT]: true,
    [PERMISSIONS.REQUEST_CANCEL]: true,
    [PERMISSIONS.REQUEST_APPROVE]: true,
    [PERMISSIONS.REQUEST_REJECT]: true,
    [PERMISSIONS.COMMENT_CREATE]: true,
    [PERMISSIONS.USER_READ]: false,
    [PERMISSIONS.USER_MANAGE]: false,
    [PERMISSIONS.USER_ROLE_UPDATE]: false,
    [PERMISSIONS.USER_STATUS_UPDATE]: false,
    [PERMISSIONS.AUDIT_READ]: false,
    [PERMISSIONS.ANALYTICS_TEAM]: true,
    [PERMISSIONS.ANALYTICS_ORGANIZATION]: false,
  },
  ADMIN: {
    [PERMISSIONS.REQUEST_CREATE]: true,
    [PERMISSIONS.REQUEST_READ_OWN]: true,
    [PERMISSIONS.REQUEST_READ_TEAM]: true,
    [PERMISSIONS.REQUEST_READ_ALL]: true,
    [PERMISSIONS.REQUEST_UPDATE_OWN]: true,
    [PERMISSIONS.REQUEST_DELETE]: true,
    [PERMISSIONS.REQUEST_SUBMIT]: true,
    [PERMISSIONS.REQUEST_CANCEL]: true,
    [PERMISSIONS.REQUEST_APPROVE]: true,
    [PERMISSIONS.REQUEST_REJECT]: true,
    [PERMISSIONS.COMMENT_CREATE]: true,
    [PERMISSIONS.USER_READ]: true,
    [PERMISSIONS.USER_MANAGE]: true,
    [PERMISSIONS.USER_ROLE_UPDATE]: true,
    [PERMISSIONS.USER_STATUS_UPDATE]: true,
    [PERMISSIONS.AUDIT_READ]: true,
    [PERMISSIONS.ANALYTICS_TEAM]: true,
    [PERMISSIONS.ANALYTICS_ORGANIZATION]: true,
  },
};

describe("permission service", () => {
  it("matches every role-permission expectation", () => {
    for (const [role, expectations] of Object.entries(roleExpectations)) {
      for (const [permission, expected] of Object.entries(expectations)) {
        expect(hasPermission(role as UserRole, permission)).toBe(expected);
      }
    }
  });

  it("denies unknown roles and empty permission checks by default", () => {
    const unknownRole = "CONTRACTOR" as UserRole;

    expect(getPermissionsForRole(unknownRole)).toEqual([]);
    expect(hasEveryPermission("ADMIN", [])).toBe(false);
    expect(hasAnyPermission("ADMIN", [])).toBe(false);
  });

  it("detects valid permission constants", () => {
    expect(isPermission(PERMISSIONS.REQUEST_APPROVE)).toBe(true);
    expect(isPermission("request:publish")).toBe(false);
  });

  it("supports all-of and any-of permission checks", () => {
    expect(
      hasEveryPermission("MANAGER", [
        PERMISSIONS.REQUEST_READ_TEAM,
        PERMISSIONS.REQUEST_APPROVE,
      ]),
    ).toBe(true);
    expect(
      hasEveryPermission("MANAGER", [
        PERMISSIONS.REQUEST_READ_TEAM,
        PERMISSIONS.USER_ROLE_UPDATE,
      ]),
    ).toBe(false);
    expect(
      hasAnyPermission("EMPLOYEE", [
        PERMISSIONS.AUDIT_READ,
        PERMISSIONS.REQUEST_CREATE,
      ]),
    ).toBe(true);
  });
});
