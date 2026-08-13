import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../../src/domain/request/request.constants.js";
import type { UserRole } from "../../../src/domain/user/user.types.js";
import type { PrismaClientLike } from "../../../src/lib/prisma.js";
import type { AuditLogRecord } from "../../../src/repositories/admin/audit/admin-audit.repository.js";
import type {
  AuditAction,
  AuditEntityType,
} from "../../../src/repositories/shared/audit-log.repository.js";
import type { AuthUserRecord } from "../../../src/repositories/shared/auth-user.repository.js";
import type { RequestSummaryRecord } from "../../../src/serializers/shared/request-summary.serializer.js";
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
let requests: RequestSummaryRecord[] = [];
let auditLogs: AuditLogRecord[] = [];

const adminId = "70000000-0000-4000-8000-000000000001";
const inactiveAdminId = "70000000-0000-4000-8000-000000000002";
const managerId = "70000000-0000-4000-8000-000000000003";
const employeeId = "70000000-0000-4000-8000-000000000004";
const inactiveEmployeeId = "70000000-0000-4000-8000-000000000005";

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
    }),
    await buildUser({
      id: inactiveAdminId,
      name: "Inactive Admin",
      email: "inactive-admin@opsflow.demo",
      role: "ADMIN",
      isActive: false,
    }),
    await buildUser({
      id: managerId,
      name: "Demo Manager",
      email: "manager@opsflow.demo",
      passwordHash: await hashPassword("Manager@123"),
      role: "MANAGER",
    }),
    await buildUser({
      id: employeeId,
      name: "Demo Employee",
      email: "employee@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      role: "EMPLOYEE",
      managerId,
    }),
    await buildUser({
      id: inactiveEmployeeId,
      name: "Inactive Employee",
      email: "inactive-employee@opsflow.demo",
      role: "EMPLOYEE",
      isActive: false,
      managerId,
    }),
  ];

  requests = [
    buildRequest({
      id: "80000000-0000-4000-8000-000000000001",
      requestNumber: "REQ-7001",
      title: "Pending equipment request",
      category: "EQUIPMENT",
      priority: "HIGH",
      status: "PENDING",
      createdById: employeeId,
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    }),
    buildRequest({
      id: "80000000-0000-4000-8000-000000000002",
      requestNumber: "REQ-7002",
      title: "In-review travel request",
      category: "TRAVEL",
      priority: "URGENT",
      status: "IN_REVIEW",
      createdById: employeeId,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    }),
    buildRequest({
      id: "80000000-0000-4000-8000-000000000003",
      requestNumber: "REQ-7003",
      title: "Approved leave request",
      category: "LEAVE",
      status: "APPROVED",
      createdById: employeeId,
      reviewedById: managerId,
      reviewedAt: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    }),
    buildRequest({
      id: "80000000-0000-4000-8000-000000000004",
      requestNumber: "REQ-7004",
      title: "Rejected software request",
      category: "SOFTWARE_ACCESS",
      status: "REJECTED",
      createdById: employeeId,
      reviewedById: managerId,
      reviewedAt: daysAgo(3),
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    }),
    buildRequest({
      id: "80000000-0000-4000-8000-000000000005",
      requestNumber: "REQ-7005",
      title: "Cancelled procurement request",
      category: "PROCUREMENT",
      status: "CANCELLED",
      createdById: employeeId,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    }),
    buildRequest({
      id: "80000000-0000-4000-8000-000000000006",
      requestNumber: "REQ-7006",
      title: "Deleted draft request",
      category: "OTHER",
      status: "DRAFT",
      createdById: employeeId,
      deletedAt: daysAgo(0),
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    }),
  ];

  auditLogs = [
    buildAuditLog({
      id: "90000000-0000-4000-8000-000000000001",
      actorId: employeeId,
      action: "REQUEST_CREATED",
      entityType: "REQUEST",
      targetRequestId: "80000000-0000-4000-8000-000000000001",
      createdAt: daysAgo(0),
    }),
    buildAuditLog({
      id: "90000000-0000-4000-8000-000000000002",
      actorId: managerId,
      action: "REQUEST_APPROVED",
      entityType: "REQUEST",
      targetRequestId: "80000000-0000-4000-8000-000000000003",
      metadata: {
        token: "should-not-leak",
        safe: "kept",
      },
      createdAt: daysAgo(1),
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("admin dashboard route", () => {
  it("returns organization-wide dashboard aggregate values", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent.get("/api/v1/admin/dashboard").expect(200);

    expect(response.body.data.metrics).toMatchObject({
      totalUsers: 5,
      activeUsers: 3,
      roleCounts: {
        ADMIN: 2,
        MANAGER: 1,
        EMPLOYEE: 2,
      },
      totalRequests: 5,
      statusCounts: {
        DRAFT: 0,
        PENDING: 1,
        IN_REVIEW: 1,
        APPROVED: 1,
        REJECTED: 1,
        CANCELLED: 1,
      },
      categoryCounts: {
        LEAVE: 1,
        EXPENSE: 0,
        EQUIPMENT: 1,
        SOFTWARE_ACCESS: 1,
        WORK_FROM_HOME: 0,
        TRAVEL: 1,
        PROCUREMENT: 1,
        OTHER: 0,
      },
    });
    expect(response.body.data.requestTrendDays).toBe(7);
    expect(response.body.data.recentRequestTrend).toHaveLength(7);
    expect(
      response.body.data.recentRequestTrend.reduce(
        (sum: number, point: { count: number }) => sum + point.count,
        0,
      ),
    ).toBe(5);
    expect(response.body.data.recentRequests).toHaveLength(5);
    expect(JSON.stringify(response.body.data.recentRequests)).not.toContain(
      "REQ-7006",
    );
    expect(response.body.data.recentActivity.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    expect(JSON.stringify(response.body)).not.toContain("should-not-leak");
  });

  it("denies non-Admin access to organization analytics", async () => {
    const managerAgent = await loginAs("manager@opsflow.demo", "Manager@123");
    const employeeAgent = await loginAs(
      "employee@opsflow.demo",
      "Employee@123",
    );

    await managerAgent.get("/api/v1/admin/dashboard").expect(403);
    await employeeAgent.get("/api/v1/admin/dashboard").expect(403);
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
    id: "70000000-0000-4000-8000-999999999999",
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

function buildRequest(
  overrides: Partial<RequestSummaryRecord>,
): RequestSummaryRecord {
  const createdById = overrides.createdById ?? employeeId;
  const reviewedById = overrides.reviewedById ?? null;

  return {
    id: "80000000-0000-4000-8000-999999999999",
    requestNumber: "REQ-7999",
    title: "Demo request",
    description: "Dashboard fixture request.",
    category: "OTHER",
    priority: "MEDIUM",
    status: "DRAFT",
    metadata: null,
    createdById,
    reviewedById,
    reviewNotes: null,
    rejectionReason: null,
    submittedAt: null,
    reviewedAt: null,
    deletedAt: null,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    createdBy: users.find((user) => user.id === createdById) ?? users[0],
    reviewedBy: reviewedById
      ? (users.find((user) => user.id === reviewedById) ?? null)
      : null,
    ...overrides,
  };
}

function buildAuditLog(overrides: Partial<AuditLogRecord>): AuditLogRecord {
  const actor =
    typeof overrides.actorId === "string"
      ? (users.find((user) => user.id === overrides.actorId) ?? null)
      : null;
  const targetRequest =
    typeof overrides.targetRequestId === "string"
      ? (requests.find((item) => item.id === overrides.targetRequestId) ?? null)
      : null;

  return {
    id: "90000000-0000-4000-8000-999999999999",
    actorId: actor?.id ?? null,
    actor,
    action: "LOGIN_SUCCESS",
    entityType: "AUTH",
    targetUserId: null,
    targetUser: null,
    targetRequestId: targetRequest?.id ?? null,
    targetRequest: targetRequest
      ? {
          id: targetRequest.id,
          requestNumber: targetRequest.requestNumber,
          title: targetRequest.title,
        }
      : null,
    targetCommentId: null,
    targetComment: null,
    metadata: null,
    ipAddress: "127.0.0.1",
    userAgent: "vitest",
    createdAt: daysAgo(0),
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
      async count(args?: { where?: { isActive?: boolean } }) {
        return users.filter((user) => {
          if (typeof args?.where?.isActive === "boolean") {
            return user.isActive === args.where.isActive;
          }

          return true;
        }).length;
      },
      async groupBy() {
        return countBy(users, "role").map(([role, count]) => ({
          role,
          _count: { role: count },
        }));
      },
      async findMany() {
        return [];
      },
    },
    request: {
      async count(args?: { where?: RequestWhere }) {
        return requests.filter((item) => matchesRequestWhere(item, args?.where))
          .length;
      },
      async groupBy(args: {
        by: ["status"] | ["category"];
        where: RequestWhere;
      }) {
        const key = args.by[0];

        return countBy(
          requests.filter((item) => matchesRequestWhere(item, args.where)),
          key,
        ).map(([value, count]) => ({
          [key]: value,
          _count: { [key]: count },
        }));
      },
      async findMany(args: {
        where: RequestWhere;
        orderBy: { createdAt: "desc" };
        take: number;
      }) {
        return requests
          .filter((item) => matchesRequestWhere(item, args.where))
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )
          .slice(0, args.take);
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
          id: `90000000-0000-4000-8000-${String(auditLogs.length + 10).padStart(12, "0")}`,
          actorId: args.data.actorId ?? null,
          targetUserId: args.data.targetUserId ?? null,
          targetRequestId: args.data.targetRequestId ?? null,
          targetCommentId: args.data.targetCommentId ?? null,
          metadata: args.data.metadata ?? null,
          ipAddress: args.data.ipAddress ?? null,
          userAgent: args.data.userAgent ?? null,
          createdAt: daysAgo(0),
        });

        auditLogs.push(auditLog);

        return auditLog;
      },
      async findMany(args: { orderBy: { createdAt: "desc" }; take: number }) {
        return [...auditLogs]
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )
          .slice(0, args.take);
      },
    },
  };

  return prisma as unknown as PrismaClientLike;
}

type RequestWhere = {
  deletedAt?: null;
  status?: RequestStatus;
  category?: RequestCategory;
  createdAt?: {
    gte?: Date;
    lt?: Date;
  };
};

function matchesRequestWhere(
  item: RequestSummaryRecord,
  where?: RequestWhere,
): boolean {
  if (!where) {
    return true;
  }

  if ("deletedAt" in where && item.deletedAt !== where.deletedAt) {
    return false;
  }

  if (where.status && item.status !== where.status) {
    return false;
  }

  if (where.category && item.category !== where.category) {
    return false;
  }

  if (where.createdAt?.gte && item.createdAt < where.createdAt.gte) {
    return false;
  }

  if (where.createdAt?.lt && item.createdAt >= where.createdAt.lt) {
    return false;
  }

  return true;
}

function countBy<TKey extends keyof RequestSummaryRecord>(
  items: RequestSummaryRecord[],
  key: TKey,
): Array<[RequestSummaryRecord[TKey], number]>;
function countBy<TKey extends keyof AuthUserRecord>(
  items: AuthUserRecord[],
  key: TKey,
): Array<[AuthUserRecord[TKey], number]>;
function countBy<TItem, TKey extends keyof TItem>(
  items: TItem[],
  key: TKey,
): Array<[TItem[TKey], number]> {
  const counts = new Map<TItem[TKey], number>();

  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }

  return [...counts.entries()];
}

function daysAgo(days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days),
  );
}
