import { describe, expect, it } from "vitest";

import { AuthenticationError } from "../../../../src/errors/authentication.error.js";
import type {
  AuthUserRecord,
  AuthUserRepositoryClient,
} from "../../../../src/repositories/shared/auth-user.repository.js";
import { hashPassword } from "../../../../src/services/auth/password.service.js";
import { verifyLoginCredentials } from "../../../../src/services/auth/login.service.js";
import { verifyAuthToken } from "../../../../src/services/auth/token.service.js";

const authEnv = {
  JWT_SECRET: "a-development-secret-that-is-long-enough",
  JWT_EXPIRES_IN: "1h",
};

function buildUser(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id: "user-1",
    name: "Demo User",
    email: "employee@opsflow.demo",
    passwordHash: "placeholder",
    role: "EMPLOYEE",
    isActive: true,
    managerId: "manager-1",
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

describe("login service", () => {
  it("returns a safe user and token for valid credentials", async () => {
    const user = buildUser({
      passwordHash: await hashPassword("Employee@123"),
    });

    const result = await verifyLoginCredentials(
      buildPrisma(user),
      {
        email: " Employee@OpsFlow.Demo ",
        password: "Employee@123",
      },
      authEnv,
    );

    expect(result.user).toEqual({
      id: "user-1",
      name: "Demo User",
      email: "employee@opsflow.demo",
      role: "EMPLOYEE",
      isActive: true,
      managerId: "manager-1",
      createdAt: "2026-08-12T10:00:00.000Z",
      updatedAt: "2026-08-12T11:00:00.000Z",
    });
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(verifyAuthToken(result.token, authEnv)).toEqual({
      sub: "user-1",
      role: "EMPLOYEE",
    });
  });

  it("rejects missing users with a generic credentials error", async () => {
    await expect(
      verifyLoginCredentials(
        buildPrisma(null),
        {
          email: "missing@opsflow.demo",
          password: "Employee@123",
        },
        authEnv,
      ),
    ).rejects.toMatchObject({
      message: "Invalid email or password",
    });
  });

  it("rejects wrong passwords with a generic credentials error", async () => {
    const user = buildUser({
      passwordHash: await hashPassword("Employee@123"),
    });

    await expect(
      verifyLoginCredentials(
        buildPrisma(user),
        {
          email: "employee@opsflow.demo",
          password: "wrong-password",
        },
        authEnv,
      ),
    ).rejects.toThrow(AuthenticationError);
  });

  it("rejects inactive accounts during credential verification", async () => {
    const user = buildUser({
      isActive: false,
      passwordHash: await hashPassword("Employee@123"),
    });

    await expect(
      verifyLoginCredentials(
        buildPrisma(user),
        {
          email: "employee@opsflow.demo",
          password: "Employee@123",
        },
        authEnv,
      ),
    ).rejects.toMatchObject({
      message: "Invalid email or password",
    });
  });
});
