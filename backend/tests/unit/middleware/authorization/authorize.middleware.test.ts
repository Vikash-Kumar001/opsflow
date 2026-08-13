import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { AuthorizationError } from "../../../../src/errors/authorization.error.js";
import { AuthenticationError } from "../../../../src/errors/authentication.error.js";
import { authorize } from "../../../../src/middleware/authorization/authorize.middleware.js";
import { PERMISSIONS } from "../../../../src/permissions/permissions.js";
import type { SerializedUserSummary } from "../../../../src/serializers/shared/user-summary.serializer.js";

describe("authorize middleware", () => {
  it("allows authenticated users with every required permission", () => {
    const next = vi.fn<NextFunction>();
    const req = buildRequest({ role: "MANAGER" });

    authorize(PERMISSIONS.REQUEST_READ_TEAM, PERMISSIONS.REQUEST_APPROVE)(
      req,
      {} as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("denies authenticated users missing a required permission", () => {
    const next = vi.fn<NextFunction>();
    const req = buildRequest({ role: "EMPLOYEE" });

    authorize(PERMISSIONS.REQUEST_APPROVE)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it("denies unauthenticated requests before permission checks", () => {
    const next = vi.fn<NextFunction>();

    authorize(PERMISSIONS.REQUEST_CREATE)({} as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
  });

  it("denies empty permission middleware usage by default", () => {
    const next = vi.fn<NextFunction>();
    const req = buildRequest({ role: "ADMIN" });

    authorize()(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });
});

function buildRequest(user: Pick<SerializedUserSummary, "role">): Request {
  return {
    user: {
      id: "user-1",
      name: "Demo User",
      email: "demo@opsflow.test",
      role: user.role,
      isActive: true,
      managerId: null,
      createdAt: "2026-08-12T00:00:00.000Z",
      updatedAt: "2026-08-12T00:00:00.000Z",
    },
  } as Request;
}
