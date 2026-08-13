import { describe, expect, it } from "vitest";

import { AuthenticationError } from "../../../../src/errors/authentication.error.js";
import type {
  AuthUserRecord,
  AuthUserRepositoryClient,
} from "../../../../src/repositories/shared/auth-user.repository.js";
import { getCurrentActiveUserFromToken } from "../../../../src/services/auth/current-user.service.js";
import { createAuthToken } from "../../../../src/services/auth/token.service.js";

const authEnv = {
  JWT_SECRET: "a-development-secret-that-is-long-enough",
  JWT_EXPIRES_IN: "1h",
};

function buildUser(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id: "user-1",
    name: "Demo User",
    email: "demo@opsflow.demo",
    passwordHash: "stored-hash",
    role: "ADMIN",
    isActive: true,
    managerId: null,
    createdAt: new Date("2026-08-12T10:00:00.000Z"),
    updatedAt: new Date("2026-08-12T11:00:00.000Z"),
    ...overrides,
  };
}

function buildPrisma(user: AuthUserRecord | null): AuthUserRepositoryClient {
  return {
    user: {
      async findUnique() {
        return user;
      },
    },
  };
}

describe("current user service", () => {
  it("returns the active serialized user for a valid token", async () => {
    const token = createAuthToken(
      {
        userId: "user-1",
        role: "ADMIN",
      },
      authEnv,
    );

    await expect(
      getCurrentActiveUserFromToken(buildPrisma(buildUser()), token, authEnv),
    ).resolves.toMatchObject({
      id: "user-1",
      email: "demo@opsflow.demo",
      role: "ADMIN",
    });
  });

  it("rejects missing tokens", async () => {
    await expect(
      getCurrentActiveUserFromToken(
        buildPrisma(buildUser()),
        undefined,
        authEnv,
      ),
    ).rejects.toThrow(AuthenticationError);
  });

  it("rejects deactivated users after token verification", async () => {
    const token = createAuthToken(
      {
        userId: "user-1",
        role: "ADMIN",
      },
      authEnv,
    );

    await expect(
      getCurrentActiveUserFromToken(
        buildPrisma(buildUser({ isActive: false })),
        token,
        authEnv,
      ),
    ).rejects.toThrow(AuthenticationError);
  });
});
