import { describe, expect, it } from "vitest";

import {
  canAccessOwnResource,
  canAccessTeamResource,
  evaluateResourcePolicy,
} from "../../../../src/policies/shared/resource-policy.js";
import type { SerializedUserSummary } from "../../../../src/serializers/shared/user-summary.serializer.js";

const actor: SerializedUserSummary = {
  id: "manager-1",
  name: "Demo Manager",
  email: "manager@opsflow.test",
  role: "MANAGER",
  isActive: true,
  managerId: null,
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("resource policy helpers", () => {
  it("checks direct ownership", () => {
    expect(
      canAccessOwnResource({
        actor,
        resource: { createdById: "manager-1" },
      }),
    ).toBe(true);
    expect(
      canAccessOwnResource({
        actor,
        resource: { createdById: "employee-1" },
      }),
    ).toBe(false);
  });

  it("checks direct manager scope", () => {
    expect(
      canAccessTeamResource({
        actor,
        resource: { requester: { managerId: "manager-1" } },
      }),
    ).toBe(true);
    expect(
      canAccessTeamResource({
        actor,
        resource: { requester: { managerId: "manager-2" } },
      }),
    ).toBe(false);
  });

  it("evaluates async policy functions", async () => {
    await expect(
      evaluateResourcePolicy(async () => true, {
        actor,
        resource: { id: "request-1" },
      }),
    ).resolves.toBe(true);
  });
});
