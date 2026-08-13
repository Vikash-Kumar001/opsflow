import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { UserRole } from "../../../src/domain/user/user.types.js";
import type { PrismaClientLike } from "../../../src/lib/prisma.js";
import type { AuditLogRecord } from "../../../src/repositories/admin/audit/admin-audit.repository.js";
import type {
  AuditAction,
  AuditEntityType,
} from "../../../src/repositories/shared/audit-log.repository.js";
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
let auditLogs: AuditLogRecord[] = [];

const adminId = "30000000-0000-4000-8000-000000000001";
const managerId = "30000000-0000-4000-8000-000000000002";
const employeeId = "30000000-0000-4000-8000-000000000003";
const requestId = "40000000-0000-4000-8000-000000000001";
const commentId = "50000000-0000-4000-8000-000000000001";
const approvalAuditId = "60000000-0000-4000-8000-000000000001";
const roleAuditId = "60000000-0000-4000-8000-000000000002";

beforeAll(async () => {
  Object.assign(process.env, testEnv);

  const appModule = await import("../../../src/app.js");
  const prismaModule = await import("../../../src/lib/prisma.js");

  app = appModule.app;
  setPrismaClientForTesting = prismaModule.setPrismaClientForTesting;
});

beforeEach(async () => {
  users = [
    await buildUser({
      id: adminId,
      name: "Demo Admin",
      email: "admin@opsflow.demo",
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
  auditLogs = [
    buildAuditLog({
      id: "60000000-0000-4000-8000-000000000003",
      actorId: employeeId,
      action: "REQUEST_CREATED",
      entityType: "REQUEST",
      targetRequestId: requestId,
      metadata: {
        requestNumber: "REQ-5001",
        password: "should-not-leak",
        nested: {
          token: "should-not-leak",
          safe: "kept",
        },
      },
      createdAt: new Date("2026-08-13T08:00:00.000Z"),
    }),
    buildAuditLog({
      id: approvalAuditId,
      actorId: managerId,
      action: "REQUEST_APPROVED",
      entityType: "REQUEST",
      targetRequestId: requestId,
      metadata: {
        requestNumber: "REQ-5001",
        fromStatus: "IN_REVIEW",
        toStatus: "APPROVED",
      },
      createdAt: new Date("2026-08-13T09:00:00.000Z"),
    }),
    buildAuditLog({
      id: roleAuditId,
      actorId: adminId,
      action: "USER_ROLE_CHANGED",
      entityType: "USER",
      targetUserId: employeeId,
      metadata: {
        fromRole: "EMPLOYEE",
        toRole: "MANAGER",
        authorization: "Bearer secret",
      },
      createdAt: new Date("2026-08-13T10:00:00.000Z"),
    }),
    buildAuditLog({
      id: "60000000-0000-4000-8000-000000000004",
      actorId: adminId,
      action: "USER_DEACTIVATED",
      entityType: "USER",
      targetUserId: employeeId,
      metadata: {
        fromIsActive: true,
        toIsActive: false,
      },
      createdAt: new Date("2026-08-13T11:00:00.000Z"),
    }),
    buildAuditLog({
      id: "60000000-0000-4000-8000-000000000005",
      actorId: employeeId,
      action: "COMMENT_CREATED",
      entityType: "COMMENT",
      targetRequestId: requestId,
      targetCommentId: commentId,
      createdAt: new Date("2026-08-13T12:00:00.000Z"),
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("admin audit routes", () => {
  it("lets Admin list and detail audit logs with safe metadata", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const listResponse = await agent
      .get("/api/v1/admin/audit-logs")
      .expect(200);

    expect(listResponse.body.data.auditLogs.length).toBeGreaterThanOrEqual(6);
    expect(listResponse.body.data.auditLogs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "LOGIN_SUCCESS" }),
        expect.objectContaining({ action: "REQUEST_CREATED" }),
        expect.objectContaining({ action: "REQUEST_APPROVED" }),
        expect.objectContaining({ action: "USER_ROLE_CHANGED" }),
        expect.objectContaining({ action: "USER_DEACTIVATED" }),
      ]),
    );
    expect(JSON.stringify(listResponse.body)).not.toContain("should-not-leak");
    expect(JSON.stringify(listResponse.body)).not.toContain("Bearer secret");
    expect(JSON.stringify(listResponse.body)).not.toContain("passwordHash");

    const detailResponse = await agent
      .get(`/api/v1/admin/audit-logs/${approvalAuditId}`)
      .expect(200);

    expect(detailResponse.body.data.auditLog).toMatchObject({
      id: approvalAuditId,
      action: "REQUEST_APPROVED",
      entityType: "REQUEST",
      actor: expect.objectContaining({
        id: managerId,
        email: "manager@opsflow.demo",
      }),
      targetRequest: {
        id: requestId,
        requestNumber: "REQ-5001",
        title: "Laptop request",
      },
      metadata: {
        requestNumber: "REQ-5001",
        fromStatus: "IN_REVIEW",
        toStatus: "APPROVED",
      },
    });
  });

  it("denies Manager and Employee access to audit logs", async () => {
    const managerAgent = await loginAs("manager@opsflow.demo", "Manager@123");
    const employeeAgent = await loginAs(
      "employee@opsflow.demo",
      "Employee@123",
    );

    await managerAgent.get("/api/v1/admin/audit-logs").expect(403);
    await employeeAgent
      .get(`/api/v1/admin/audit-logs/${roleAuditId}`)
      .expect(403);
  });

  it("supports filters, search, date ranges, and pagination", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent
      .get("/api/v1/admin/audit-logs")
      .query({
        search: "REQ-5001",
        action: "REQUEST_APPROVED",
        actorId: managerId,
        entityType: "REQUEST",
        targetRequestId: requestId,
        createdFrom: "2026-08-13T08:30:00.000Z",
        createdTo: "2026-08-13T09:30:00.000Z",
        page: 1,
        limit: 1,
      })
      .expect(200);

    expect(response.body.data.auditLogs).toHaveLength(1);
    expect(response.body.data.auditLogs[0]).toMatchObject({
      id: approvalAuditId,
      action: "REQUEST_APPROVED",
    });
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 1,
    });
  });

  it("returns 404 for missing audit detail and exposes no mutation API", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    await agent
      .get("/api/v1/admin/audit-logs/60000000-0000-4000-8000-000000009999")
      .expect(404);
    await agent
      .delete(`/api/v1/admin/audit-logs/${approvalAuditId}`)
      .expect(404);
    await agent
      .patch(`/api/v1/admin/audit-logs/${approvalAuditId}`)
      .send({ metadata: {} })
      .expect(404);
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
    id: "30000000-0000-4000-8000-999999999999",
    name: "Demo User",
    email: "demo@opsflow.demo",
    passwordHash: await hashPassword("Employee@123"),
    role: "EMPLOYEE",
    isActive: true,
    managerId: null,
    createdAt: new Date("2026-08-13T07:00:00.000Z"),
    updatedAt: new Date("2026-08-13T07:00:00.000Z"),
    ...overrides,
  };
}

function buildAuditLog(overrides: Partial<AuditLogRecord>): AuditLogRecord {
  const actor =
    typeof overrides.actorId === "string"
      ? (users.find((user) => user.id === overrides.actorId) ?? null)
      : null;
  const targetUser =
    typeof overrides.targetUserId === "string"
      ? (users.find((user) => user.id === overrides.targetUserId) ?? null)
      : null;

  return {
    id: "60000000-0000-4000-8000-999999999999",
    actorId: actor?.id ?? null,
    actor,
    action: "LOGIN_SUCCESS",
    entityType: "AUTH",
    targetUserId: targetUser?.id ?? null,
    targetUser,
    targetRequestId: null,
    targetRequest: null,
    targetCommentId: null,
    targetComment: null,
    metadata: null,
    ipAddress: "127.0.0.1",
    userAgent: "vitest",
    createdAt: new Date("2026-08-13T07:00:00.000Z"),
    ...overrides,
    targetRequest: overrides.targetRequestId
      ? {
          id: overrides.targetRequestId,
          requestNumber: "REQ-5001",
          title: "Laptop request",
        }
      : (overrides.targetRequest ?? null),
    targetComment: overrides.targetCommentId
      ? {
          id: overrides.targetCommentId,
          content: "Comment content",
        }
      : (overrides.targetComment ?? null),
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
      async findMany() {
        return [];
      },
    },
    auditLog: {
      async create(args: {
        data: {
          actorId?: string | null;
          action: AuditAction;
          entityType: AuditEntityType;
          targetUserId?: string | null;
          targetRequestId?: string | null;
          targetCommentId?: string | null;
          metadata?: Record<string, unknown>;
          ipAddress?: string;
          userAgent?: string;
        };
      }) {
        const auditLog = buildAuditLog({
          ...args.data,
          id: `60000000-0000-4000-8000-${String(auditLogs.length + 10).padStart(12, "0")}`,
          actorId: args.data.actorId ?? null,
          targetUserId: args.data.targetUserId ?? null,
          targetRequestId: args.data.targetRequestId ?? null,
          targetCommentId: args.data.targetCommentId ?? null,
          metadata: args.data.metadata ?? null,
          ipAddress: args.data.ipAddress ?? null,
          userAgent: args.data.userAgent ?? null,
          createdAt: new Date("2026-08-13T13:00:00.000Z"),
        });

        auditLogs.push(auditLog);

        return auditLog;
      },
      async findMany(args: {
        where: AuditLogWhere;
        orderBy: { createdAt: "desc" };
        skip: number;
        take: number;
      }) {
        return auditLogs
          .filter((auditLog) => matchesWhere(auditLog, args.where))
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )
          .slice(args.skip, args.skip + args.take);
      },
      async count(args: { where: AuditLogWhere }) {
        return auditLogs.filter((auditLog) =>
          matchesWhere(auditLog, args.where),
        ).length;
      },
      async findUnique(args: { where: { id: string } }) {
        return (
          auditLogs.find((auditLog) => auditLog.id === args.where.id) ?? null
        );
      },
    },
  };

  return prisma as unknown as PrismaClientLike;
}

type AuditLogWhere = {
  id?: string;
  action?: AuditAction;
  actorId?: string;
  entityType?: AuditEntityType;
  targetUserId?: string;
  targetRequestId?: string;
  targetCommentId?: string;
  createdAt?: { gte?: Date; lte?: Date };
  OR?: Array<{
    actor?: {
      is: { name?: { contains: string }; email?: { contains: string } };
    };
    targetUser?: {
      is: { name?: { contains: string }; email?: { contains: string } };
    };
    targetRequest?: {
      is: {
        requestNumber?: { contains: string };
        title?: { contains: string };
      };
    };
  }>;
};

function matchesWhere(auditLog: AuditLogRecord, where: AuditLogWhere): boolean {
  if (where.id && auditLog.id !== where.id) {
    return false;
  }

  if (where.action && auditLog.action !== where.action) {
    return false;
  }

  if (where.actorId && auditLog.actorId !== where.actorId) {
    return false;
  }

  if (where.entityType && auditLog.entityType !== where.entityType) {
    return false;
  }

  if (where.targetUserId && auditLog.targetUserId !== where.targetUserId) {
    return false;
  }

  if (
    where.targetRequestId &&
    auditLog.targetRequestId !== where.targetRequestId
  ) {
    return false;
  }

  if (
    where.targetCommentId &&
    auditLog.targetCommentId !== where.targetCommentId
  ) {
    return false;
  }

  if (where.createdAt?.gte && auditLog.createdAt < where.createdAt.gte) {
    return false;
  }

  if (where.createdAt?.lte && auditLog.createdAt > where.createdAt.lte) {
    return false;
  }

  if (where.OR) {
    return where.OR.some((condition) => {
      const needle = (
        condition.actor?.is.name?.contains ??
        condition.actor?.is.email?.contains ??
        condition.targetUser?.is.name?.contains ??
        condition.targetUser?.is.email?.contains ??
        condition.targetRequest?.is.requestNumber?.contains ??
        condition.targetRequest?.is.title?.contains ??
        ""
      ).toLowerCase();

      return (
        auditLog.actor?.name.toLowerCase().includes(needle) ||
        auditLog.actor?.email.toLowerCase().includes(needle) ||
        auditLog.targetUser?.name.toLowerCase().includes(needle) ||
        auditLog.targetUser?.email.toLowerCase().includes(needle) ||
        auditLog.targetRequest?.requestNumber.toLowerCase().includes(needle) ||
        auditLog.targetRequest?.title.toLowerCase().includes(needle) ||
        false
      );
    });
  }

  return true;
}
