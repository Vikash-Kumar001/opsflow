import { describe, expect, it } from "vitest";

import {
  serializeUserSummary,
  userSummarySelect,
} from "../../../../src/serializers/shared/user-summary.serializer.js";

describe("user summary serializer", () => {
  it("does not select sensitive password fields", () => {
    expect(userSummarySelect).not.toHaveProperty("passwordHash");
  });

  it("serializes safe user summary fields", () => {
    const serialized = serializeUserSummary({
      id: "user-id",
      name: "Demo User",
      email: "demo@opsflow.demo",
      role: "EMPLOYEE",
      isActive: true,
      managerId: "manager-id",
      createdAt: new Date("2026-08-12T10:00:00.000Z"),
      updatedAt: new Date("2026-08-12T11:00:00.000Z"),
    });

    expect(serialized).toEqual({
      id: "user-id",
      name: "Demo User",
      email: "demo@opsflow.demo",
      role: "EMPLOYEE",
      isActive: true,
      managerId: "manager-id",
      createdAt: "2026-08-12T10:00:00.000Z",
      updatedAt: "2026-08-12T11:00:00.000Z",
    });
    expect(serialized).not.toHaveProperty("passwordHash");
  });
});
