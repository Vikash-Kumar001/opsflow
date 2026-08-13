import { describe, expect, it } from "vitest";

import {
  getSafeReturnTo,
  resolvePostLoginRedirect,
} from "@/features/auth/utils/auth-redirects";
import type { AuthUser } from "@/features/auth/types/auth.types";

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

describe("auth redirects", () => {
  it("rejects external or login return URLs", () => {
    expect(getSafeReturnTo("https://example.com/admin/dashboard")).toBeNull();
    expect(getSafeReturnTo("//example.com/admin/dashboard")).toBeNull();
    expect(getSafeReturnTo("/login")).toBeNull();
  });

  it("preserves safe internal return URLs", () => {
    expect(getSafeReturnTo("/requests?status=PENDING#top")).toBe(
      "/requests?status=PENDING#top",
    );
  });

  it("redirects to the role landing page when return URL is not authorized", () => {
    expect(
      resolvePostLoginRedirect(baseUser, "/admin/dashboard"),
    ).toBe("/employee/dashboard");
  });
});
