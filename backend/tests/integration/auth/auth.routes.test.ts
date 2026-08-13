import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { PrismaClientLike } from "../../../src/lib/prisma.js";
import type { AuthUserRecord } from "../../../src/repositories/shared/auth-user.repository.js";
import { hashPassword } from "../../../src/services/auth/password.service.js";

const testEnv = {
  NODE_ENV: "test",
  PORT: "5001",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/opsflow",
  JWT_SECRET: "a-development-secret-that-is-long-enough",
  JWT_EXPIRES_IN: "1h",
  FRONTEND_ORIGIN: "http://localhost:3000",
};

const auditEntries: unknown[] = [];
let users: AuthUserRecord[] = [];
let app: typeof import("../../../src/app.js").app;
let setPrismaClientForTesting: typeof import("../../../src/lib/prisma.js").setPrismaClientForTesting;

beforeAll(async () => {
  Object.assign(process.env, testEnv);

  const appModule = await import("../../../src/app.js");
  const prismaModule = await import("../../../src/lib/prisma.js");

  app = appModule.app;
  setPrismaClientForTesting = prismaModule.setPrismaClientForTesting;
});

beforeEach(async () => {
  auditEntries.length = 0;
  users = [
    buildUser({
      id: "active-user-id",
      email: "employee@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      isActive: true,
    }),
    buildUser({
      id: "inactive-user-id",
      email: "inactive@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      isActive: false,
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("auth routes", () => {
  it("logs in with valid credentials and sets an HttpOnly session cookie", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "employee@opsflow.demo",
        password: "Employee@123",
      })
      .expect(200);

    const cookies = response.headers["set-cookie"];

    expect(cookies?.[0]).toContain("opsflow_session=");
    expect(cookies?.[0]).toContain("HttpOnly");
    expect(cookies?.[0]).toContain("SameSite=Lax");
    expect(response.body.data.user).toMatchObject({
      id: "active-user-id",
      email: "employee@opsflow.demo",
      role: "EMPLOYEE",
      isActive: true,
    });
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    expect(auditEntries).toContainEqual(
      expect.objectContaining({ action: "LOGIN_SUCCESS" }),
    );
  });

  it("rejects invalid email/password with a generic response", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "employee@opsflow.demo",
        password: "wrong-password",
      })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    expect(auditEntries).toContainEqual(
      expect.objectContaining({ action: "LOGIN_FAILED" }),
    );
  });

  it("rejects inactive users during login", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "inactive@opsflow.demo",
        password: "Employee@123",
      })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("returns the current user for authenticated requests", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/login").send({
      email: "employee@opsflow.demo",
      password: "Employee@123",
    });

    const response = await agent.get("/api/v1/auth/me").expect(200);

    expect(response.body.data.user).toMatchObject({
      id: "active-user-id",
      email: "employee@opsflow.demo",
    });
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("rejects unauthenticated current-user requests", async () => {
    const response = await request(app).get("/api/v1/auth/me").expect(401);

    expect(response.body.error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  });

  it("clears the session cookie on logout", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/login").send({
      email: "employee@opsflow.demo",
      password: "Employee@123",
    });

    const response = await agent.post("/api/v1/auth/logout").expect(200);
    const cookies = response.headers["set-cookie"];

    expect(response.body.data).toEqual({ loggedOut: true });
    expect(cookies?.[0]).toContain("opsflow_session=");
    expect(cookies?.[0]).toContain("Expires=Thu, 01 Jan 1970");
    expect(auditEntries).toContainEqual(
      expect.objectContaining({ action: "LOGOUT" }),
    );
  });

  it("changes the current active user's password without exposing hashes", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/login").send({
      email: "employee@opsflow.demo",
      password: "Employee@123",
    });

    const response = await agent
      .patch("/api/v1/auth/password")
      .send({
        currentPassword: "Employee@123",
        newPassword: "Employee@456",
      })
      .expect(200);

    expect(response.body.data.user).toMatchObject({
      id: "active-user-id",
      email: "employee@opsflow.demo",
    });
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    expect(
      await request(app).post("/api/v1/auth/login").send({
        email: "employee@opsflow.demo",
        password: "Employee@456",
      }),
    ).toMatchObject({ status: 200 });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({ action: "PASSWORD_CHANGED" }),
    );
  });

  it("rejects password change when the current password is wrong", async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/login").send({
      email: "employee@opsflow.demo",
      password: "Employee@123",
    });

    const response = await agent
      .patch("/api/v1/auth/password")
      .send({
        currentPassword: "wrong-password",
        newPassword: "Employee@456",
      })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
    expect(
      await request(app).post("/api/v1/auth/login").send({
        email: "employee@opsflow.demo",
        password: "Employee@123",
      }),
    ).toMatchObject({ status: 200 });
  });
});

function buildUser(overrides: Partial<AuthUserRecord>): AuthUserRecord {
  return {
    id: "user-id",
    name: "Demo User",
    email: "demo@opsflow.demo",
    passwordHash: "hash",
    role: "EMPLOYEE",
    isActive: true,
    managerId: "manager-id",
    createdAt: new Date("2026-08-12T10:00:00.000Z"),
    updatedAt: new Date("2026-08-12T11:00:00.000Z"),
    ...overrides,
  };
}

function buildPrisma(): PrismaClientLike {
  return {
    async $connect() {},
    async $disconnect() {},
    user: {
      async findUnique(args) {
        if ("email" in args.where) {
          return users.find((user) => user.email === args.where.email) ?? null;
        }

        return users.find((user) => user.id === args.where.id) ?? null;
      },
      async update(args) {
        const user = users.find((item) => item.id === args.where.id);

        if (!user) {
          throw new Error("User not found");
        }

        user.passwordHash = args.data.passwordHash;
        user.updatedAt = new Date("2026-08-13T12:00:00.000Z");

        return user;
      },
    },
    auditLog: {
      async create(args) {
        auditEntries.push(args.data);
        return args.data;
      },
    },
  };
}
