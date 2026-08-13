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
import type { CommentRecord } from "../../../src/serializers/shared/comments/comment.serializer.js";
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
let nextRequestNumber = 3000n;
let competingTransitionRequestId: string | null = null;

beforeAll(async () => {
  Object.assign(process.env, testEnv);

  const appModule = await import("../../../src/app.js");
  const prismaModule = await import("../../../src/lib/prisma.js");

  app = appModule.app;
  setPrismaClientForTesting = prismaModule.setPrismaClientForTesting;
}, 20_000);

beforeEach(async () => {
  auditEntries = [];
  nextRequestNumber = 3000n;
  competingTransitionRequestId = null;
  users = [
    await buildUser({
      id: "manager-1",
      name: "Review Manager",
      email: "manager@opsflow.demo",
      passwordHash: await hashPassword("Manager@123"),
      role: "MANAGER",
      managerId: "manager-1",
    }),
    await buildUser({
      id: "manager-2",
      name: "Other Manager",
      email: "other-manager@opsflow.demo",
      passwordHash: await hashPassword("Manager@123"),
      role: "MANAGER",
    }),
    await buildUser({
      id: "employee-1",
      name: "Direct Report",
      email: "employee@opsflow.demo",
      role: "EMPLOYEE",
      managerId: "manager-1",
    }),
    await buildUser({
      id: "employee-2",
      name: "Other Report",
      email: "other-report@opsflow.demo",
      role: "EMPLOYEE",
      managerId: "manager-2",
    }),
    await buildUser({
      id: "employee-3",
      name: "Inactive Report",
      email: "inactive-report@opsflow.demo",
      role: "EMPLOYEE",
      isActive: false,
      managerId: "manager-1",
    }),
  ];
  requests = [
    buildRequest({
      id: "10000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3000",
      title: "Team laptop request",
      description: "Direct report needs a development laptop.",
      createdById: "employee-1",
      status: "PENDING",
      priority: "HIGH",
      submittedAt: new Date("2026-08-12T09:00:00.000Z"),
    }),
    buildRequest({
      id: "20000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3001",
      title: "Team travel request",
      description: "Direct report needs travel approval.",
      createdById: "employee-1",
      status: "IN_REVIEW",
      category: "TRAVEL",
      submittedAt: new Date("2026-08-12T09:30:00.000Z"),
    }),
    buildRequest({
      id: "30000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3002",
      title: "Other team software request",
      description: "Another manager's report needs access.",
      createdById: "employee-2",
      status: "PENDING",
      category: "SOFTWARE_ACCESS",
      submittedAt: new Date("2026-08-12T10:00:00.000Z"),
    }),
    buildRequest({
      id: "40000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3003",
      title: "Manager personal request",
      description: "Manager request should be requester-only, not team review.",
      createdById: "manager-1",
      status: "PENDING",
      submittedAt: new Date("2026-08-12T11:00:00.000Z"),
    }),
    buildRequest({
      id: "50000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3004",
      title: "Deleted team request",
      description: "Deleted team requests stay hidden from manager queues.",
      createdById: "employee-1",
      status: "PENDING",
      deletedAt: new Date("2026-08-12T12:00:00.000Z"),
    }),
    buildRequest({
      id: "60000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3005",
      title: "Concurrent review request",
      description:
        "This request is used to simulate a competing terminal update.",
      createdById: "employee-1",
      status: "IN_REVIEW",
      submittedAt: new Date("2026-08-12T13:00:00.000Z"),
    }),
    buildRequest({
      id: "70000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3006",
      title: "Recently approved team request",
      description: "Approved team work counted in recent manager analytics.",
      createdById: "employee-1",
      status: "APPROVED",
      reviewedById: "manager-1",
      reviewedAt: new Date(),
    }),
    buildRequest({
      id: "80000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3007",
      title: "Recently rejected team request",
      description: "Rejected team work counted in recent manager analytics.",
      createdById: "employee-1",
      status: "REJECTED",
      reviewedById: "manager-1",
      reviewedAt: new Date(),
    }),
    buildRequest({
      id: "90000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3008",
      title: "Other team urgent request",
      description: "Other team's urgent request must not leak into metrics.",
      createdById: "employee-2",
      status: "PENDING",
      priority: "URGENT",
      submittedAt: new Date("2026-08-12T14:00:00.000Z"),
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("manager request routes", () => {
  it("lists only the manager's direct reports' non-deleted team requests", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent.get("/api/v1/manager/requests").expect(200);

    expect(response.body.data.requests).toHaveLength(5);
    expect(response.body.data.requests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "10000000-0000-4000-8000-000000000000",
          requester: expect.objectContaining({
            id: "employee-1",
            managerId: "manager-1",
          }),
        }),
      ]),
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "30000000-0000-4000-8000-000000000000",
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "40000000-0000-4000-8000-000000000000",
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "50000000-0000-4000-8000-000000000000",
    );
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("does not let a manager see another manager's reports", async () => {
    const agent = await loginAs("other-manager@opsflow.demo", "Manager@123");

    const response = await agent.get("/api/v1/manager/requests").expect(200);

    expect(response.body.data.requests).toHaveLength(2);
    expect(response.body.data.requests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "30000000-0000-4000-8000-000000000000",
          requester: expect.objectContaining({
            id: "employee-2",
            managerId: "manager-2",
          }),
        }),
        expect.objectContaining({
          id: "90000000-0000-4000-8000-000000000000",
          requester: expect.objectContaining({
            id: "employee-2",
            managerId: "manager-2",
          }),
        }),
      ]),
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "10000000-0000-4000-8000-000000000000",
    );
  });

  it("fetches authorized team request detail with requester summary fields", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .get("/api/v1/manager/requests/10000000-0000-4000-8000-000000000000")
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "10000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-3000",
      requester: {
        id: "employee-1",
        email: "employee@opsflow.demo",
        name: "Direct Report",
        role: "EMPLOYEE",
        managerId: "manager-1",
      },
    });
    expect(response.body.data.request).not.toHaveProperty("createdBy");
    expect(response.body.data.request).not.toHaveProperty("metadata");
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("returns privacy-preserving 404 for another manager's team request by ID", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .get("/api/v1/manager/requests/30000000-0000-4000-8000-000000000000")
      .expect(404);

    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: "Request not found",
    });
  });

  it("keeps search, filters, sorting, and pagination scoped to the manager team", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .get("/api/v1/manager/requests")
      .query({
        search: "team",
        status: "PENDING",
        page: 1,
        limit: 1,
        sortBy: "title",
        sortDirection: "asc",
      })
      .expect(200);

    expect(response.body.data.requests).toHaveLength(1);
    expect(response.body.data.requests[0]).toMatchObject({
      id: "10000000-0000-4000-8000-000000000000",
      title: "Team laptop request",
    });
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 1,
    });
  });

  it("rejects employee access to manager team routes", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent.get("/api/v1/manager/requests").expect(403);
  });

  it("returns manager dashboard metrics scoped to the manager's team", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent.get("/api/v1/manager/dashboard").expect(200);

    expect(response.body.data.metrics).toEqual({
      pendingApprovals: 1,
      inReview: 2,
      approvedRecent: 1,
      rejectedRecent: 1,
      urgentRequests: 0,
    });
    expect(response.body.data.recentPeriodDays).toBe(30);
    expect(response.body.data.recentTeamRequests).toHaveLength(5);
    expect(JSON.stringify(response.body.data)).not.toContain(
      "30000000-0000-4000-8000-000000000000",
    );
    expect(JSON.stringify(response.body.data)).not.toContain(
      "90000000-0000-4000-8000-000000000000",
    );
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("does not include another manager's team data in dashboard analytics", async () => {
    const agent = await loginAs("other-manager@opsflow.demo", "Manager@123");

    const response = await agent.get("/api/v1/manager/dashboard").expect(200);

    expect(response.body.data.metrics).toEqual({
      pendingApprovals: 2,
      inReview: 0,
      approvedRecent: 0,
      rejectedRecent: 0,
      urgentRequests: 1,
    });
    expect(JSON.stringify(response.body.data)).not.toContain(
      "10000000-0000-4000-8000-000000000000",
    );
    expect(JSON.stringify(response.body.data)).not.toContain(
      "70000000-0000-4000-8000-000000000000",
    );
  });

  it("rejects employee access to manager dashboard analytics", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent.get("/api/v1/manager/dashboard").expect(403);
  });

  it("lets an authorized manager start review", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/10000000-0000-4000-8000-000000000000/start-review",
      )
      .send({ reviewNotes: "Review is underway." })
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "10000000-0000-4000-8000-000000000000",
      status: "IN_REVIEW",
      reviewNotes: "Review is underway.",
      reviewer: expect.objectContaining({
        id: "manager-1",
      }),
    });
    expect(response.body.data.request.reviewedAt).toEqual(expect.any(String));
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "REQUEST_REVIEW_STARTED",
        targetRequestId: "10000000-0000-4000-8000-000000000000",
      }),
    );
  });

  it("approves a valid in-review team request and audits once", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/20000000-0000-4000-8000-000000000000/approve",
      )
      .send({ reviewNotes: "Approved for this sprint." })
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "20000000-0000-4000-8000-000000000000",
      status: "APPROVED",
      reviewNotes: "Approved for this sprint.",
      rejectionReason: null,
      reviewer: expect.objectContaining({
        id: "manager-1",
      }),
    });
    expect(response.body.data.request.reviewedAt).toEqual(expect.any(String));

    await agent
      .patch(
        "/api/v1/manager/requests/20000000-0000-4000-8000-000000000000/approve",
      )
      .send({})
      .expect(200);

    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_APPROVED",
      ),
    ).toHaveLength(1);
  });

  it("rejects a valid in-review team request with a bounded reason", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/20000000-0000-4000-8000-000000000000/reject",
      )
      .send({
        rejectionReason: "Insufficient business justification.",
        reviewNotes: "Requester can resubmit with clearer details.",
      })
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "20000000-0000-4000-8000-000000000000",
      status: "REJECTED",
      rejectionReason: "Insufficient business justification.",
      reviewNotes: "Requester can resubmit with clearer details.",
      reviewer: expect.objectContaining({
        id: "manager-1",
      }),
    });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "REQUEST_REJECTED",
        targetRequestId: "20000000-0000-4000-8000-000000000000",
      }),
    );
  });

  it("rejects a pending team request from the approval queue", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/10000000-0000-4000-8000-000000000000/reject",
      )
      .send({
        rejectionReason: "The request needs additional context.",
      })
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "10000000-0000-4000-8000-000000000000",
      status: "REJECTED",
      rejectionReason: "The request needs additional context.",
      reviewer: expect.objectContaining({
        id: "manager-1",
      }),
    });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "REQUEST_REJECTED",
        targetRequestId: "10000000-0000-4000-8000-000000000000",
      }),
    );
  });

  it("rejects empty rejection reasons", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/20000000-0000-4000-8000-000000000000/reject",
      )
      .send({ rejectionReason: "" })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("blocks self-approval", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/40000000-0000-4000-8000-000000000000/approve",
      )
      .send({})
      .expect(403);

    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("blocks cross-team approval with a privacy-preserving 404", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .patch(
        "/api/v1/manager/requests/30000000-0000-4000-8000-000000000000/approve",
      )
      .send({})
      .expect(404);

    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: "Request not found",
    });
  });

  it("blocks employee direct approval", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .patch(
        "/api/v1/manager/requests/20000000-0000-4000-8000-000000000000/approve",
      )
      .send({})
      .expect(403);
  });

  it("handles a simulated competing terminal transition safely", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");
    competingTransitionRequestId = "60000000-0000-4000-8000-000000000000";

    const response = await agent
      .patch(
        "/api/v1/manager/requests/60000000-0000-4000-8000-000000000000/reject",
      )
      .send({ rejectionReason: "The request became stale during review." })
      .expect(409);

    expect(response.body.error.code).toBe("INVALID_TRANSITION");
    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_REJECTED",
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
    id: "user-id",
    name: "Demo User",
    email: "demo@opsflow.demo",
    passwordHash: await hashPassword("Employee@123"),
    role: "EMPLOYEE",
    isActive: true,
    managerId: null,
    createdAt: new Date("2026-08-12T10:00:00.000Z"),
    updatedAt: new Date("2026-08-12T11:00:00.000Z"),
    ...overrides,
  };
}

function buildRequest(
  overrides: Partial<RequestSummaryRecord>,
): RequestSummaryRecord {
  const createdBy =
    users.find((user) => user.id === overrides.createdById) ?? users[0];

  return {
    id: "request-id",
    requestNumber: "REQ-3000",
    title: "Request title",
    description: "Request description for manager integration testing.",
    category: "EQUIPMENT",
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
    createdAt: new Date("2026-08-12T10:00:00.000Z"),
    updatedAt: new Date("2026-08-12T11:00:00.000Z"),
    createdBy,
    reviewedBy:
      typeof overrides.reviewedById === "string"
        ? (users.find((user) => user.id === overrides.reviewedById) ?? null)
        : null,
    ...overrides,
  };
}

function buildPrisma(): PrismaClientLike {
  const prisma = {
    async $connect() {},
    async $disconnect() {},
    async $transaction<T>(
      callback: (transaction: PrismaClientLike) => Promise<T>,
    ) {
      return callback(prisma);
    },
    user: {
      async findUnique(args) {
        if ("email" in args.where) {
          return users.find((user) => user.email === args.where.email) ?? null;
        }

        return users.find((user) => user.id === args.where.id) ?? null;
      },
      async findMany(args) {
        return users
          .filter(
            (user) =>
              user.managerId === args.where.managerId &&
              user.isActive === args.where.isActive,
          )
          .map((user) => ({ id: user.id }));
      },
    },
    requestNumberCounter: {
      async upsert() {
        nextRequestNumber += 1n;

        return { nextValue: nextRequestNumber };
      },
    },
    request: {
      async create() {
        throw new Error("Request creation is not used by manager route tests.");
      },
      async findMany(args) {
        return requests
          .filter((requestRecord) => matchesWhere(requestRecord, args.where))
          .sort((left, right) => compareRequests(left, right, args.orderBy))
          .slice(args.skip, args.skip + args.take);
      },
      async count(args) {
        return requests.filter((requestRecord) =>
          matchesWhere(requestRecord, args.where),
        ).length;
      },
      async findFirst(args) {
        return (
          requests.find((requestRecord) =>
            matchesWhere(requestRecord, args.where),
          ) ?? null
        );
      },
      async updateMany(args) {
        if (args.where.id === competingTransitionRequestId) {
          updateRequestInMemory(args.where.id, {
            status: "APPROVED",
            reviewedById: "manager-2",
            reviewedAt: new Date("2026-08-12T16:00:00.000Z"),
            reviewNotes: "Competing approval won.",
            rejectionReason: null,
          });
          competingTransitionRequestId = null;

          return { count: 0 };
        }

        const matchingRequest = requests.find((requestRecord) =>
          matchesWhere(requestRecord, args.where),
        );

        if (!matchingRequest) {
          return { count: 0 };
        }

        updateRequestInMemory(matchingRequest.id, args.data);

        return { count: 1 };
      },
      async update() {
        throw new Error("Request updates are not used by manager route tests.");
      },
    },
    comment: {
      async findMany(): Promise<CommentRecord[]> {
        return [];
      },
      async create() {
        throw new Error("Comments are not used by manager route tests.");
      },
    },
    auditLog: {
      async create(args) {
        auditEntries.push(args.data);
        return args.data;
      },
    },
  } satisfies PrismaClientLike;

  return prisma;
}

function matchesWhere(
  requestRecord: RequestSummaryRecord,
  where: {
    id?: string;
    deletedAt?: null;
    NOT?: { createdById: string };
    createdBy?: { managerId: string };
    createdById?: string | { in: string[] };
    status?: RequestStatus;
    category?: RequestCategory;
    priority?: RequestPriority;
    createdAt?: { gte?: Date; lte?: Date };
    reviewedAt?: { gte?: Date };
    OR?: Array<{
      title?: { contains: string };
      description?: { contains: string };
      requestNumber?: { contains: string };
    }>;
  },
): boolean {
  if (where.id && requestRecord.id !== where.id) {
    return false;
  }

  if (where.deletedAt === null && requestRecord.deletedAt !== null) {
    return false;
  }

  if (
    where.NOT?.createdById &&
    requestRecord.createdById === where.NOT.createdById
  ) {
    return false;
  }

  if (
    where.createdBy?.managerId &&
    requestRecord.createdBy.managerId !== where.createdBy.managerId
  ) {
    return false;
  }

  if (typeof where.createdById === "string") {
    if (requestRecord.createdById !== where.createdById) {
      return false;
    }
  } else if (where.createdById?.in) {
    if (!where.createdById.in.includes(requestRecord.createdById)) {
      return false;
    }
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

  if (where.reviewedAt?.gte) {
    if (
      !requestRecord.reviewedAt ||
      requestRecord.reviewedAt < where.reviewedAt.gte
    ) {
      return false;
    }
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

function updateRequestInMemory(
  id: string,
  data: Partial<RequestSummaryRecord>,
): void {
  const index = requests.findIndex((requestRecord) => requestRecord.id === id);

  if (index === -1) {
    return;
  }

  const reviewedBy =
    typeof data.reviewedById === "string"
      ? (users.find((user) => user.id === data.reviewedById) ?? null)
      : data.reviewedById === null
        ? null
        : requests[index].reviewedBy;

  requests[index] = {
    ...requests[index],
    ...data,
    reviewedBy,
    updatedAt: new Date("2026-08-12T15:30:00.000Z"),
  };
}

function isAuditEntry(value: unknown): value is { action: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    typeof value.action === "string"
  );
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
