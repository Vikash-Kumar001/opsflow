import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../../src/domain/request/request.constants.js";
import type { UserRole } from "../../../src/domain/user/user.types.js";
import type { PrismaClientLike } from "../../../src/lib/prisma.js";
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
let comments: Array<{ id: string; requestId: string }> = [];
let auditEntries: unknown[] = [];

const adminId = "10000000-0000-4000-8000-000000000001";
const managerId = "10000000-0000-4000-8000-000000000002";
const employeeOneId = "10000000-0000-4000-8000-000000000003";
const employeeTwoId = "10000000-0000-4000-8000-000000000004";
const employeeOneRequestId = "20000000-0000-4000-8000-000000000001";
const employeeTwoRequestId = "20000000-0000-4000-8000-000000000002";

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
      id: employeeOneId,
      name: "First Employee",
      email: "employee@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      role: "EMPLOYEE",
      managerId,
    }),
    await buildUser({
      id: employeeTwoId,
      name: "Second Employee",
      email: "second@opsflow.demo",
      passwordHash: await hashPassword("Employee@123"),
      role: "EMPLOYEE",
      managerId,
    }),
  ];
  requests = [
    buildRequest({
      id: employeeOneRequestId,
      requestNumber: "REQ-4001",
      title: "Laptop request",
      description: "Employee needs a laptop for backend work.",
      category: "EQUIPMENT",
      priority: "HIGH",
      status: "PENDING",
      createdById: employeeOneId,
      submittedAt: new Date("2026-08-13T09:00:00.000Z"),
    }),
    buildRequest({
      id: employeeTwoRequestId,
      requestNumber: "REQ-4002",
      title: "Travel request",
      description: "Employee needs travel approval.",
      category: "TRAVEL",
      priority: "URGENT",
      status: "IN_REVIEW",
      createdById: employeeTwoId,
      submittedAt: new Date("2026-08-13T10:00:00.000Z"),
    }),
    buildRequest({
      id: "20000000-0000-4000-8000-000000000003",
      requestNumber: "REQ-4003",
      title: "Deleted request",
      description: "This request should stay hidden from normal admin lists.",
      createdById: employeeOneId,
      deletedAt: new Date("2026-08-13T11:00:00.000Z"),
    }),
  ];
  comments = [{ id: "comment-1", requestId: employeeOneRequestId }];

  setPrismaClientForTesting(buildPrisma());
});

describe("admin request routes", () => {
  it("lets Admin view organization-wide non-deleted requests", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent.get("/api/v1/admin/requests").expect(200);

    expect(response.body.data.requests).toHaveLength(2);
    expect(response.body.data.requests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: employeeOneRequestId,
          createdById: employeeOneId,
        }),
        expect.objectContaining({
          id: employeeTwoRequestId,
          createdById: employeeTwoId,
        }),
      ]),
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "REQ-4003",
    );
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");

    const detailResponse = await agent
      .get(`/api/v1/admin/requests/${employeeTwoRequestId}`)
      .expect(200);

    expect(detailResponse.body.data.request).toMatchObject({
      id: employeeTwoRequestId,
      createdById: employeeTwoId,
      title: "Travel request",
    });
    expect(JSON.stringify(detailResponse.body)).not.toContain("passwordHash");
  });

  it("denies non-Admin access to Admin request endpoints and request deletion", async () => {
    const managerAgent = await loginAs("manager@opsflow.demo", "Manager@123");
    const employeeAgent = await loginAs(
      "employee@opsflow.demo",
      "Employee@123",
    );

    await managerAgent.get("/api/v1/admin/requests").expect(403);
    await employeeAgent
      .delete(`/api/v1/requests/${employeeOneRequestId}`)
      .expect(403);
  });

  it("supports organization-wide pagination, filtering, search, and sorting", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent
      .get("/api/v1/admin/requests")
      .query({
        search: "travel",
        status: "IN_REVIEW",
        category: "TRAVEL",
        priority: "URGENT",
        page: 1,
        limit: 1,
        sortBy: "title",
        sortDirection: "asc",
      })
      .expect(200);

    expect(response.body.data.requests).toHaveLength(1);
    expect(response.body.data.requests[0]).toMatchObject({
      id: employeeTwoRequestId,
      title: "Travel request",
    });
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 1,
    });
  });

  it("soft deletes a request, preserves related history, and writes audit", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    const response = await agent
      .delete(`/api/v1/requests/${employeeOneRequestId}`)
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: employeeOneRequestId,
      requestNumber: "REQ-4001",
    });
    expect(response.body.data.request.deletedAt).toEqual(expect.any(String));
    expect(
      requests.find(
        (requestRecord) => requestRecord.id === employeeOneRequestId,
      )?.deletedAt,
    ).toBeInstanceOf(Date);
    expect(comments).toContainEqual({
      id: "comment-1",
      requestId: employeeOneRequestId,
    });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "REQUEST_DELETED",
        targetRequestId: employeeOneRequestId,
      }),
    );

    await agent
      .get(`/api/v1/admin/requests/${employeeOneRequestId}`)
      .expect(404);
    await agent
      .get("/api/v1/admin/requests")
      .expect(200)
      .then((listResponse) => {
        expect(JSON.stringify(listResponse.body.data.requests)).not.toContain(
          employeeOneRequestId,
        );
      });
  });

  it("does not hard-delete already deleted or missing requests", async () => {
    const agent = await loginAs("admin@opsflow.demo", "Admin@123");

    await agent
      .delete("/api/v1/requests/20000000-0000-4000-8000-000000000003")
      .expect(404);
    await agent
      .delete("/api/v1/requests/20000000-0000-4000-8000-000000009999")
      .expect(404);

    expect(requests).toHaveLength(3);
    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_DELETED",
      ),
    ).toHaveLength(0);
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
    id: "10000000-0000-4000-8000-999999999999",
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

function buildRequest(
  overrides: Partial<RequestSummaryRecord>,
): RequestSummaryRecord {
  const createdBy =
    users.find((user) => user.id === overrides.createdById) ?? users[0];

  return {
    id: "20000000-0000-4000-8000-999999999999",
    requestNumber: "REQ-4000",
    title: "Request title",
    description: "Request description for admin integration testing.",
    category: "OTHER",
    priority: "MEDIUM",
    status: "DRAFT",
    createdById: createdBy.id,
    reviewedById: null,
    reviewNotes: null,
    rejectionReason: null,
    metadata: null,
    submittedAt: null,
    reviewedAt: null,
    deletedAt: null,
    createdAt: new Date("2026-08-13T09:00:00.000Z"),
    updatedAt: new Date("2026-08-13T10:00:00.000Z"),
    createdBy,
    reviewedBy: null,
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
      async findMany(args: {
        where: AdminRequestWhere;
        orderBy: Partial<Record<string, "asc" | "desc">>;
        skip: number;
        take: number;
      }) {
        return requests
          .filter((requestRecord) => matchesWhere(requestRecord, args.where))
          .sort((left, right) => compareRequests(left, right, args.orderBy))
          .slice(args.skip, args.skip + args.take);
      },
      async count(args: { where: AdminRequestWhere }) {
        return requests.filter((requestRecord) =>
          matchesWhere(requestRecord, args.where),
        ).length;
      },
      async findFirst(args: { where: AdminRequestWhere }) {
        return (
          requests.find((requestRecord) =>
            matchesWhere(requestRecord, args.where),
          ) ?? null
        );
      },
      async update(args: {
        where: { id: string };
        data: { deletedAt?: Date };
      }) {
        const index = requests.findIndex(
          (requestRecord) => requestRecord.id === args.where.id,
        );

        if (index === -1) {
          throw new Error("Request not found");
        }

        requests[index] = {
          ...requests[index],
          deletedAt: args.data.deletedAt ?? requests[index].deletedAt,
          updatedAt: new Date("2026-08-13T12:00:00.000Z"),
        };

        return requests[index];
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

type AdminRequestWhere = {
  id?: string;
  deletedAt?: null;
  status?: RequestStatus;
  category?: RequestCategory;
  priority?: RequestPriority;
  createdAt?: { gte?: Date; lte?: Date };
  OR?: Array<{
    title?: { contains: string };
    description?: { contains: string };
    requestNumber?: { contains: string };
  }>;
};

function matchesWhere(
  requestRecord: RequestSummaryRecord,
  where: AdminRequestWhere,
): boolean {
  if (where.id && requestRecord.id !== where.id) {
    return false;
  }

  if (where.deletedAt === null && requestRecord.deletedAt !== null) {
    return false;
  }

  if (where.status && requestRecord.status !== where.status) {
    return false;
  }

  if (where.category && requestRecord.category !== where.category) {
    return false;
  }

  if (where.priority && requestRecord.priority !== where.priority) {
    return false;
  }

  if (where.createdAt?.gte && requestRecord.createdAt < where.createdAt.gte) {
    return false;
  }

  if (where.createdAt?.lte && requestRecord.createdAt > where.createdAt.lte) {
    return false;
  }

  if (where.OR) {
    return where.OR.some((condition) => {
      const needle = (
        condition.title?.contains ??
        condition.description?.contains ??
        condition.requestNumber?.contains ??
        ""
      ).toLowerCase();

      return (
        requestRecord.title.toLowerCase().includes(needle) ||
        requestRecord.description.toLowerCase().includes(needle) ||
        requestRecord.requestNumber.toLowerCase().includes(needle)
      );
    });
  }

  return true;
}

function compareRequests(
  left: RequestSummaryRecord,
  right: RequestSummaryRecord,
  orderBy: Partial<Record<string, "asc" | "desc">>,
): number {
  const [field = "createdAt", direction = "desc"] =
    Object.entries(orderBy)[0] ?? [];
  const leftValue = left[field as keyof RequestSummaryRecord];
  const rightValue = right[field as keyof RequestSummaryRecord];
  const multiplier = direction === "asc" ? 1 : -1;

  if (leftValue === rightValue) {
    return 0;
  }

  return leftValue > rightValue ? multiplier : -multiplier;
}

function isAuditEntry(value: unknown): value is { action: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    typeof value.action === "string"
  );
}
