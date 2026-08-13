import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../../src/domain/request/request.constants.js";
import type { UserRole } from "../../../src/domain/user/user.types.js";
import type { PrismaClientLike } from "../../../src/lib/prisma.js";
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
let auditEntries: unknown[] = [];

const employeeId = "a0000000-0000-4000-8000-000000000001";
const otherEmployeeId = "a0000000-0000-4000-8000-000000000002";
const managerId = "a0000000-0000-4000-8000-000000000003";
const adminId = "a0000000-0000-4000-8000-000000000004";

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
      id: employeeId,
      name: "Demo Employee",
      email: "employee@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      role: "EMPLOYEE",
      managerId,
    }),
    await buildUser({
      id: otherEmployeeId,
      name: "Other Employee",
      email: "other@opsflow.demo",
      role: "EMPLOYEE",
      managerId,
    }),
    await buildUser({
      id: managerId,
      name: "Demo Manager",
      email: "manager@opsflow.demo",
      passwordHash: await hashPassword("Manager@123"),
      role: "MANAGER",
    }),
    await buildUser({
      id: adminId,
      name: "Demo Admin",
      email: "admin@opsflow.demo",
      passwordHash: await hashPassword("Admin@123"),
      role: "ADMIN",
    }),
  ];
  requests = [
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000001",
      requestNumber: "REQ-9001",
      title: "Draft laptop request",
      status: "DRAFT",
      createdById: employeeId,
      updatedAt: daysAgo(5),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000002",
      requestNumber: "REQ-9002",
      title: "Pending software request",
      status: "PENDING",
      category: "SOFTWARE_ACCESS",
      createdById: employeeId,
      updatedAt: daysAgo(0),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000003",
      requestNumber: "REQ-9003",
      title: "In review travel request",
      status: "IN_REVIEW",
      category: "TRAVEL",
      createdById: employeeId,
      updatedAt: daysAgo(1),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000004",
      requestNumber: "REQ-9004",
      title: "Approved leave request",
      status: "APPROVED",
      category: "LEAVE",
      createdById: employeeId,
      reviewedById: managerId,
      reviewedAt: daysAgo(2),
      updatedAt: daysAgo(2),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000005",
      requestNumber: "REQ-9005",
      title: "Rejected equipment request",
      status: "REJECTED",
      category: "EQUIPMENT",
      createdById: employeeId,
      reviewedById: managerId,
      reviewedAt: daysAgo(3),
      updatedAt: daysAgo(3),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000006",
      requestNumber: "REQ-9006",
      title: "Cancelled procurement request",
      status: "CANCELLED",
      category: "PROCUREMENT",
      createdById: employeeId,
      updatedAt: daysAgo(4),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000007",
      requestNumber: "REQ-9007",
      title: "Deleted employee request",
      status: "PENDING",
      createdById: employeeId,
      deletedAt: daysAgo(0),
    }),
    buildRequest({
      id: "b0000000-0000-4000-8000-000000000008",
      requestNumber: "REQ-9008",
      title: "Other employee pending request",
      status: "PENDING",
      createdById: otherEmployeeId,
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("employee dashboard route", () => {
  it("returns metrics and recent requests scoped to the authenticated employee", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent.get("/api/v1/employee/dashboard").expect(200);

    expect(response.body.data.metrics).toEqual({
      totalRequests: 6,
      draftRequests: 1,
      pendingRequests: 1,
      inReviewRequests: 1,
      approvedRequests: 1,
      rejectedRequests: 1,
      cancelledRequests: 1,
    });
    expect(response.body.data.recentRequests).toHaveLength(5);
    expect(response.body.data.recentRequests[0]).toMatchObject({
      id: "b0000000-0000-4000-8000-000000000002",
      createdById: employeeId,
      title: "Pending software request",
    });
    expect(JSON.stringify(response.body.data)).not.toContain("REQ-9007");
    expect(JSON.stringify(response.body.data)).not.toContain("REQ-9008");
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("denies Manager and Admin access to the Employee dashboard route", async () => {
    const managerAgent = await loginAs("manager@opsflow.demo", "Manager@123");
    const adminAgent = await loginAs("admin@opsflow.demo", "Admin@123");

    await managerAgent.get("/api/v1/employee/dashboard").expect(403);
    await adminAgent.get("/api/v1/employee/dashboard").expect(403);
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
    id: "a0000000-0000-4000-8000-999999999999",
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
    id: "b0000000-0000-4000-8000-999999999999",
    requestNumber: "REQ-9999",
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
    request: {
      async count(args: { where: RequestWhere }) {
        return requests.filter((item) => matchesRequestWhere(item, args.where))
          .length;
      },
      async findMany(args: {
        where: RequestWhere;
        orderBy: { updatedAt: "desc" };
        take: number;
      }) {
        return requests
          .filter((item) => matchesRequestWhere(item, args.where))
          .sort(
            (left, right) =>
              right.updatedAt.getTime() - left.updatedAt.getTime(),
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
        auditEntries.push(args.data);
        return args.data;
      },
    },
  };

  return prisma as unknown as PrismaClientLike;
}

type RequestWhere = {
  deletedAt?: null;
  createdById?: string;
  status?: RequestStatus;
};

function matchesRequestWhere(
  item: RequestSummaryRecord,
  where: RequestWhere,
): boolean {
  if ("deletedAt" in where && item.deletedAt !== where.deletedAt) {
    return false;
  }

  if (where.createdById && item.createdById !== where.createdById) {
    return false;
  }

  if (where.status && item.status !== where.status) {
    return false;
  }

  return true;
}

function daysAgo(days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days),
  );
}
