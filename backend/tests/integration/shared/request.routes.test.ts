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
import type { RequestCreateInput } from "../../../src/repositories/shared/requests/request.repository.js";
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
let comments: CommentRecord[] = [];
let auditEntries: unknown[] = [];
let nextRequestNumber = 2000n;

beforeAll(async () => {
  Object.assign(process.env, testEnv);

  const appModule = await import("../../../src/app.js");
  const prismaModule = await import("../../../src/lib/prisma.js");

  app = appModule.app;
  setPrismaClientForTesting = prismaModule.setPrismaClientForTesting;
});

beforeEach(async () => {
  auditEntries = [];
  comments = [];
  nextRequestNumber = 2000n;
  users = [
    await buildUser({
      id: "employee-1",
      name: "Demo Employee",
      email: "employee@opsflow.demo",
      role: "EMPLOYEE",
      managerId: "manager-1",
    }),
    await buildUser({
      id: "employee-2",
      name: "Other Employee",
      email: "other@opsflow.demo",
      role: "EMPLOYEE",
      managerId: "manager-1",
    }),
    await buildUser({
      id: "manager-1",
      name: "Demo Manager",
      email: "manager@opsflow.demo",
      passwordHash: await hashPassword("Manager@123"),
      role: "MANAGER",
      managerId: null,
    }),
    await buildUser({
      id: "admin-1",
      name: "Demo Admin",
      email: "admin@opsflow.demo",
      passwordHash: await hashPassword("Admin@123"),
      role: "ADMIN",
      managerId: null,
    }),
  ];
  requests = [
    buildRequest({
      id: "00000000-0000-4000-8000-000000000000",
      requestNumber: "REQ-1000",
      title: "Draft request",
      createdById: "employee-1",
      status: "DRAFT",
    }),
    buildRequest({
      id: "11111111-1111-4111-8111-111111111111",
      requestNumber: "REQ-1001",
      title: "Laptop request",
      createdById: "employee-1",
      status: "PENDING",
    }),
    buildRequest({
      id: "22222222-2222-4222-8222-222222222222",
      requestNumber: "REQ-1002",
      title: "Travel request",
      createdById: "employee-2",
      status: "DRAFT",
    }),
    buildRequest({
      id: "33333333-3333-4333-8333-333333333333",
      requestNumber: "REQ-1003",
      title: "Deleted request",
      createdById: "employee-1",
      deletedAt: new Date("2026-08-12T12:00:00.000Z"),
    }),
    buildRequest({
      id: "55555555-5555-4555-8555-555555555555",
      requestNumber: "REQ-1005",
      title: "Approved request",
      createdById: "employee-1",
      status: "APPROVED",
    }),
    buildRequest({
      id: "66666666-6666-4666-8666-666666666666",
      requestNumber: "REQ-1006",
      title: "Rejected request",
      createdById: "employee-1",
      status: "REJECTED",
    }),
    buildRequest({
      id: "77777777-7777-4777-8777-777777777777",
      requestNumber: "REQ-1007",
      title: "Cancelled request",
      createdById: "employee-1",
      status: "CANCELLED",
    }),
  ];
  comments = [
    buildComment({
      id: "comment-1",
      requestId: "11111111-1111-4111-8111-111111111111",
      authorId: "employee-1",
      content: "Initial employee context.",
    }),
    buildComment({
      id: "comment-2",
      requestId: "22222222-2222-4222-8222-222222222222",
      authorId: "employee-2",
      content: "Other employee private note.",
    }),
  ];

  setPrismaClientForTesting(buildPrisma());
});

describe("request routes", () => {
  it("lets an employee create a draft request and writes an audit event", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .post("/api/v1/requests")
      .send({
        title: "New equipment request",
        description: "A development laptop is needed for onboarding.",
        category: "EQUIPMENT",
        priority: "HIGH",
      })
      .expect(201);

    expect(response.body.data.request).toMatchObject({
      requestNumber: "REQ-2000",
      title: "New equipment request",
      status: "DRAFT",
      createdById: "employee-1",
      submittedAt: null,
    });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "REQUEST_CREATED",
        targetRequestId: response.body.data.request.id,
      }),
    );
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("creates a pending request when submit is explicit", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .post("/api/v1/requests")
      .send({
        title: "Work from home",
        description: "Need to work from home for a family appointment.",
        category: "WORK_FROM_HOME",
        submit: true,
      })
      .expect(201);

    expect(response.body.data.request.status).toBe("PENDING");
    expect(response.body.data.request.submittedAt).toEqual(expect.any(String));
  });

  it("lists only the employee's non-deleted requests", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent.get("/api/v1/requests").expect(200);

    expect(response.body.data.requests).toHaveLength(5);
    expect(response.body.data.requests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "11111111-1111-4111-8111-111111111111",
          createdById: "employee-1",
        }),
      ]),
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(JSON.stringify(response.body.data.requests)).not.toContain(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(response.body.data.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 5,
    });
  });

  it("supports search, filters, pagination, and allowlisted sorting", async () => {
    const agent = await loginAs("manager@opsflow.demo", "Manager@123");

    const response = await agent
      .get("/api/v1/requests")
      .query({
        search: "travel",
        status: "DRAFT",
        page: 1,
        limit: 5,
        sortBy: "title",
        sortDirection: "asc",
      })
      .expect(200);

    expect(response.body.data.requests).toHaveLength(1);
    expect(response.body.data.requests[0].title).toBe("Travel request");
  });

  it("lets an employee read their own request", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .get("/api/v1/requests/11111111-1111-4111-8111-111111111111")
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "11111111-1111-4111-8111-111111111111",
      createdById: "employee-1",
    });
  });

  it("returns privacy-preserving 404 for another employee's request", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .get("/api/v1/requests/22222222-2222-4222-8222-222222222222")
      .expect(404);

    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: "Request not found",
    });
  });

  it("rejects mass-assignment fields", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .post("/api/v1/requests")
      .send({
        title: "Mass assignment attempt",
        description: "Client should never be allowed to set protected fields.",
        category: "OTHER",
        status: "APPROVED",
        createdById: "employee-2",
      })
      .expect(400);
  });

  it("rejects invalid filters and pagination", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent.get("/api/v1/requests").query({ status: "OPEN" }).expect(400);
    await agent.get("/api/v1/requests").query({ page: 0 }).expect(400);
  });

  it("hides soft-deleted requests from detail", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .get("/api/v1/requests/33333333-3333-4333-8333-333333333333")
      .expect(404);
  });

  it("lets an employee edit their own draft request", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .patch("/api/v1/requests/00000000-0000-4000-8000-000000000000")
      .send({
        title: "Updated draft request",
        description: "The employee updated ordinary editable request fields.",
        priority: "URGENT",
      })
      .expect(200);

    expect(response.body.data.request).toMatchObject({
      id: "00000000-0000-4000-8000-000000000000",
      title: "Updated draft request",
      priority: "URGENT",
      status: "DRAFT",
      createdById: "employee-1",
    });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "REQUEST_UPDATED",
        targetRequestId: "00000000-0000-4000-8000-000000000000",
      }),
    );
  });

  it("prevents an employee from editing another user's request", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .patch("/api/v1/requests/22222222-2222-4222-8222-222222222222")
      .send({
        title: "Unauthorized edit",
        description: "This should not update another employee request.",
      })
      .expect(404);
  });

  it("prevents editing approved, rejected, and cancelled requests", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    for (const id of [
      "55555555-5555-4555-8555-555555555555",
      "66666666-6666-4666-8666-666666666666",
      "77777777-7777-4777-8777-777777777777",
    ]) {
      const response = await agent
        .patch(`/api/v1/requests/${id}`)
        .send({
          title: "Terminal edit attempt",
          description: "Terminal requests must not be editable by employees.",
        })
        .expect(409);

      expect(response.body.error.code).toBe("INVALID_TRANSITION");
    }
  });

  it("submits a valid draft request and audits once", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .patch("/api/v1/requests/00000000-0000-4000-8000-000000000000/submit")
      .expect(200);

    expect(response.body.data.request.status).toBe("PENDING");
    expect(response.body.data.request.submittedAt).toEqual(expect.any(String));
    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_SUBMITTED",
      ),
    ).toHaveLength(1);

    await agent
      .patch("/api/v1/requests/00000000-0000-4000-8000-000000000000/submit")
      .expect(200);

    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_SUBMITTED",
      ),
    ).toHaveLength(1);
  });

  it("cancels an eligible request and audits once", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .patch("/api/v1/requests/11111111-1111-4111-8111-111111111111/cancel")
      .expect(200);

    expect(response.body.data.request.status).toBe("CANCELLED");
    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_CANCELLED",
      ),
    ).toHaveLength(1);

    await agent
      .patch("/api/v1/requests/11111111-1111-4111-8111-111111111111/cancel")
      .expect(200);

    expect(
      auditEntries.filter(
        (entry) => isAuditEntry(entry) && entry.action === "REQUEST_CANCELLED",
      ),
    ).toHaveLength(1);
  });

  it("returns a controlled conflict for illegal submit and cancel transitions", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const submitResponse = await agent
      .patch("/api/v1/requests/55555555-5555-4555-8555-555555555555/submit")
      .expect(409);

    expect(submitResponse.body.error.code).toBe("INVALID_TRANSITION");

    const cancelResponse = await agent
      .patch("/api/v1/requests/55555555-5555-4555-8555-555555555555/cancel")
      .expect(409);

    expect(cancelResponse.body.error.code).toBe("INVALID_TRANSITION");
  });

  it("rejects protected fields during generic update", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .patch("/api/v1/requests/00000000-0000-4000-8000-000000000000")
      .send({
        title: "Protected field attempt",
        description: "Generic update must not accept workflow fields.",
        status: "APPROVED",
        submittedAt: "2026-08-12T12:00:00.000Z",
      })
      .expect(400);
  });

  it("lets an employee list and create comments on their own request", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const listResponse = await agent
      .get("/api/v1/requests/11111111-1111-4111-8111-111111111111/comments")
      .expect(200);

    expect(listResponse.body.data.comments).toHaveLength(1);
    expect(listResponse.body.data.comments[0]).toMatchObject({
      id: "comment-1",
      authorId: "employee-1",
      content: "Initial employee context.",
    });
    expect(JSON.stringify(listResponse.body)).not.toContain("passwordHash");

    const createResponse = await agent
      .post("/api/v1/requests/11111111-1111-4111-8111-111111111111/comments")
      .send({
        content: "Adding more context from the signed-in employee.",
      })
      .expect(201);

    expect(createResponse.body.data.comment).toMatchObject({
      requestId: "11111111-1111-4111-8111-111111111111",
      authorId: "employee-1",
      content: "Adding more context from the signed-in employee.",
    });
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        action: "COMMENT_CREATED",
        targetRequestId: "11111111-1111-4111-8111-111111111111",
        targetCommentId: createResponse.body.data.comment.id,
      }),
    );
    expect(JSON.stringify(createResponse.body)).not.toContain("passwordHash");
  });

  it("prevents an employee from listing or commenting on another request", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .get("/api/v1/requests/22222222-2222-4222-8222-222222222222/comments")
      .expect(404);

    await agent
      .post("/api/v1/requests/22222222-2222-4222-8222-222222222222/comments")
      .send({
        content: "This should not be visible or writable.",
      })
      .expect(404);
  });

  it("rejects unauthenticated comment listing", async () => {
    await request(app)
      .get("/api/v1/requests/11111111-1111-4111-8111-111111111111/comments")
      .expect(401);
  });

  it("rejects empty and oversized comments", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    await agent
      .post("/api/v1/requests/11111111-1111-4111-8111-111111111111/comments")
      .send({
        content: "",
      })
      .expect(400);

    await agent
      .post("/api/v1/requests/11111111-1111-4111-8111-111111111111/comments")
      .send({
        content: "x".repeat(2001),
      })
      .expect(400);
  });

  it("does not allow comment author spoofing", async () => {
    const agent = await loginAs("employee@opsflow.demo", "Employee@123");

    const response = await agent
      .post("/api/v1/requests/11111111-1111-4111-8111-111111111111/comments")
      .send({
        content: "Server should keep the real author.",
        authorId: "employee-2",
        createdAt: "2026-08-12T12:00:00.000Z",
      })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_FAILED");
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
    requestNumber: "REQ-1000",
    title: "Request title",
    description: "Request description for integration testing.",
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
    reviewedBy: null,
    ...overrides,
  };
}

function buildComment(overrides: Partial<CommentRecord>): CommentRecord {
  const author =
    users.find((user) => user.id === overrides.authorId) ?? users[0];

  return {
    id: "comment-id",
    requestId: "request-id",
    authorId: author.id,
    content: "Comment content",
    createdAt: new Date("2026-08-12T10:30:00.000Z"),
    updatedAt: new Date("2026-08-12T10:30:00.000Z"),
    author,
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
      async update() {
        const value = nextRequestNumber;
        nextRequestNumber += 1n;

        return { nextValue: nextRequestNumber };
      },
    },
    request: {
      async create(args) {
        const request = buildRequest({
          ...args.data,
          id: `44444444-4444-4444-8444-${String(requests.length).padStart(12, "0")}`,
          createdAt: new Date("2026-08-12T13:00:00.000Z"),
          updatedAt: new Date("2026-08-12T13:00:00.000Z"),
          submittedAt: args.data.submittedAt ?? null,
          metadata: args.data.metadata ?? null,
        });

        requests.push(request);

        return request;
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
      async update(args) {
        const index = requests.findIndex(
          (requestRecord) => requestRecord.id === args.where.id,
        );

        if (index === -1) {
          throw new Error("Request not found");
        }

        const existingRequest = requests[index];
        const updatedRequest = {
          ...existingRequest,
          ...args.data,
          submittedAt:
            args.data.submittedAt === undefined
              ? existingRequest.submittedAt
              : args.data.submittedAt,
          metadata:
            args.data.metadata === undefined
              ? existingRequest.metadata
              : args.data.metadata,
          updatedAt: new Date("2026-08-12T14:00:00.000Z"),
        };

        requests[index] = updatedRequest;

        return updatedRequest;
      },
    },
    comment: {
      async findMany(args) {
        return comments
          .filter((comment) => comment.requestId === args.where.requestId)
          .sort(
            (left, right) =>
              left.createdAt.getTime() - right.createdAt.getTime(),
          );
      },
      async create(args) {
        const comment = buildComment({
          ...args.data,
          id: `comment-${comments.length + 1}`,
          createdAt: new Date("2026-08-12T15:00:00.000Z"),
          updatedAt: new Date("2026-08-12T15:00:00.000Z"),
        });

        comments.push(comment);

        return comment;
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

function isAuditEntry(value: unknown): value is { action: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    typeof value.action === "string"
  );
}

function matchesWhere(
  requestRecord: RequestSummaryRecord,
  where: {
    id?: string;
    deletedAt?: null;
    createdById?: string | { in: string[] };
    status?: RequestStatus;
    category?: RequestCategory;
    priority?: RequestPriority;
    createdAt?: { gte?: Date; lte?: Date };
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
