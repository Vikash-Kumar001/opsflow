import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { UserRole } from "../../../src/domain/user/user.types.js";
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

let app: typeof import("../../../src/app.js").app;
let setPrismaClientForTesting: typeof import("../../../src/lib/prisma.js").setPrismaClientForTesting;
let users: AuthUserRecord[] = [];
let auditEntries: unknown[] = [];

const adminId = "00000000-0000-4000-8000-000000000001";
const secondAdminId = "00000000-0000-4000-8000-000000000002";
const managerId = "00000000-0000-4000-8000-000000000003";
const employeeId = "00000000-0000-4000-8000-000000000004";

beforeAll(async () => {
  Object.assign(process.env, testEnv);

  const appModule = await import("../../../src/app.js");
  const prismaModule = await import("../../../src/lib/prisma.js");

  app = appModule.app;
  setPrismaClientForTesting = prismaModule.setPrismaClientForTesting;
});

beforeEach(async () => {
  auditEntries = [];
  users = [
    await buildUser({
      id: adminId,
      name: "Primary Admin",
      email: "admin@opsflow.demo",
      passwordHash: await hashPassword("Admin@123"),
      role: "ADMIN",
      managerId: null,
    }),
    await buildUser({
      id: secondAdminId,
      name: "Second Admin",
      email: "second-admin@opsflow.demo",
      passwordHash: await hashPassword("Admin@123"),
      role: "ADMIN",
      managerId: null,
    }),
    await buildUser({
      id: managerId,
      name: "Demo Manager",
      email: "manager@opsflow.demo",
      passwordHash: await hashPassword("Manager@123"),
      role: "MANAGER",
      managerId: null,
    }),
    await buildUser({
      id: employeeId,
      name: "Demo Employee",
      email: "employee@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      role: "EMPLOYEE",
      managerId,
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("admin user routes", () => {
  it("lets an Admin list, filter, read, and create users safely", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const listResponse = await agent
      .get("/api/v1/admin/users")
      .query({ search: "demo", role: "EMPLOYEE", isActive: "true" })
      .expect(200);

    expect(listResponse.body.data.users).toHaveLength(1);
    expect(listResponse.body.data.users[0]).toMatchObject({
      id: employeeId,
      email: "employee@opsflow.demo",
      role: "EMPLOYEE",
    });
    expect(JSON.stringify(listResponse.body)).not.toContain("passwordHash");

    const detailResponse = await agent
      .get(`/api/v1/admin/users/${managerId}`)
      .expect(200);

    expect(detailResponse.body.data.user).toMatchObject({
      id: managerId,
      email: "manager@opsflow.demo",
      role: "MANAGER",
    });
    expect(JSON.stringify(detailResponse.body)).not.toContain("passwordHash");

    const createResponse = await agent
      .post("/api/v1/admin/users")
      .send({
        name: "New Employee",
        email: "  NEW-EMPLOYEE@opsflow.demo  ",
        password: "NewUser@123",
        role: "EMPLOYEE",
        managerId,
      })
      .expect(201);

    expect(createResponse.body.data.user).toMatchObject({
      email: "new-employee@opsflow.demo",
      role: "EMPLOYEE",
      managerId,
      isActive: true,
    });
    expect(JSON.stringify(createResponse.body)).not.toContain("passwordHash");
    expect(
      users.find((user) => user.email === "new-employee@opsflow.demo")
        ?.passwordHash,
    ).not.toBe("NewUser@123");
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "USER_CREATED",
        targetUserId: createResponse.body.data.user.id,
      }),
    );
  });

  it("lets an Admin change role and status with audit records", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const roleResponse = await agent
      .patch(`/api/v1/admin/users/${employeeId}/role`)
      .send({ role: "MANAGER" })
      .expect(200);

    expect(roleResponse.body.data.user.role).toBe("MANAGER");
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "USER_ROLE_CHANGED",
        targetUserId: employeeId,
      }),
    );

    const statusResponse = await agent
      .patch(`/api/v1/admin/users/${employeeId}/status`)
      .send({ isActive: false })
      .expect(200);

    expect(statusResponse.body.data.user.isActive).toBe(false);
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "USER_DEACTIVATED",
        targetUserId: employeeId,
      }),
    );
  });

  it("blocks Manager and Employee access to Admin user management", async () => {
    const managerAgent = await loginAs("manager@opsflow.demo", "Manager@123");
    const employeeAgent = await loginAs(
      "employee@opsflow.demo",
      "Employee@123",
    );

    await managerAgent.get("/api/v1/admin/users").expect(403);
    await employeeAgent
      .patch(`/api/v1/admin/users/${employeeId}/role`)
      .send({ role: "ADMIN" })
      .expect(403);
  });

  it("rejects privilege escalation fields in generic create input", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent
      .post("/api/v1/admin/users")
      .send({
        name: "Escalation Attempt",
        email: "escalate@opsflow.demo",
        password: "Escalate@123",
        role: "EMPLOYEE",
        passwordHash: "plain-text",
        createdAt: "2026-08-13T00:00:00.000Z",
      })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("protects the last active Admin from demotion and deactivation", async () => {
    users = users.filter((user) => user.id !== secondAdminId);
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    await agent
      .patch(`/api/v1/admin/users/${adminId}/role`)
      .send({ role: "MANAGER" })
      .expect(409);

    await agent
      .patch(`/api/v1/admin/users/${adminId}/status`)
      .send({ isActive: false })
      .expect(403);
  });

  it("prevents Admin self-deactivation even when another Admin exists", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent
      .patch(`/api/v1/admin/users/${adminId}/status`)
      .send({ isActive: false })
      .expect(403);

    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects duplicate normalized email addresses", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent
      .post("/api/v1/admin/users")
      .send({
        name: "Duplicate Email",
        email: "EMPLOYEE@opsflow.demo",
        password: "Duplicate@123",
        role: "EMPLOYEE",
      })
      .expect(409);

    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("causes deactivated users to lose protected access with cookie auth", async () => {
    const managerAgent = await loginAs("manager@opsflow.demo", "Manager@123");
    const adminAgent = await loginAs("admin@opsflow.demo", "Admin@123");

    await managerAgent.get("/api/v1/auth/me").expect(200);

    await adminAgent
      .patch(`/api/v1/admin/users/${managerId}/status`)
      .send({ isActive: false })
      .expect(200);

    await managerAgent.get("/api/v1/auth/me").expect(401);
  });
});

async function loginAs(email: string, password: string) {
  const agent = request.agent(app);

  await agent.post("/api/v1/auth/login").send({ email, password }).expect(200);

  return agent;
}

async function buildUser(
  overrides: Partial<AuthUserRecord>,
): Promise<AuthUserRecord> {
  return {
    id: "00000000-0000-4000-8000-999999999999",
    name: "Demo User",
    email: "demo@opsflow.demo",
    passwordHash: await hashPassword("Employee@123"),
    role: "EMPLOYEE",
    isActive: true,
    managerId: null,
    createdAt: new Date("2026-08-13T09:00:00.000Z"),
    updatedAt: new Date("2026-08-13T10:00:00.000Z"),
    ...overrides,
  };
}

function buildPrisma(): PrismaClientLike {
  const prisma = {
    async $connect() {},
    async $disconnect() {},
    async $transaction<T>(
      callback: (transaction: typeof prisma) => Promise<T>,
    ) {
      return callback(prisma);
    },
    user: {
      async findUnique(args: { where: { id?: string; email?: string } }) {
        if (args.where.email) {
          return users.find((user) => user.email === args.where.email) ?? null;
        }

        return users.find((user) => user.id === args.where.id) ?? null;
      },
      async findMany(args: {
        where: AdminUserWhere;
        orderBy: { createdAt: "desc" };
        skip: number;
        take: number;
      }) {
        return users
          .filter((user) => matchesWhere(user, args.where))
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )
          .slice(args.skip, args.skip + args.take);
      },
      async count(args: { where: AdminUserWhere }) {
        return users.filter((user) => matchesWhere(user, args.where)).length;
      },
      async create(args: {
        data: {
          name: string;
          email: string;
          passwordHash: string;
          role: UserRole;
          isActive: boolean;
          managerId?: string | null;
        };
      }) {
        const user = await buildUser({
          ...args.data,
          id: `00000000-0000-4000-8000-${String(users.length + 10).padStart(12, "0")}`,
          managerId: args.data.managerId ?? null,
          createdAt: new Date("2026-08-13T11:00:00.000Z"),
          updatedAt: new Date("2026-08-13T11:00:00.000Z"),
        });

        users.push(user);

        return user;
      },
      async update(args: {
        where: { id: string };
        data: { role?: UserRole; isActive?: boolean };
      }) {
        const index = users.findIndex((user) => user.id === args.where.id);

        if (index === -1) {
          throw new Error("User not found");
        }

        users[index] = {
          ...users[index],
          ...args.data,
          updatedAt: new Date("2026-08-13T12:00:00.000Z"),
        };

        return users[index];
      },
    },
    auditLog: {
      async create(args: { data: unknown }) {
        auditEntries.push(args.data);
        return args.data;
      },
    },
  };

  return prisma as unknown as PrismaClientLike;
}

type AdminUserWhere = {
  id?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  OR?: Array<{
    name?: { contains: string };
    email?: { contains: string };
  }>;
};

function matchesWhere(user: AuthUserRecord, where: AdminUserWhere): boolean {
  if (where.id && user.id !== where.id) {
    return false;
  }

  if (where.email && user.email !== where.email) {
    return false;
  }

  if (where.role && user.role !== where.role) {
    return false;
  }

  if (where.isActive !== undefined && user.isActive !== where.isActive) {
    return false;
  }

  if (where.OR) {
    return where.OR.some((condition) => {
      const needle = (
        condition.name?.contains ??
        condition.email?.contains ??
        ""
      ).toLowerCase();

      return (
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle)
      );
    });
  }

  return true;
}
