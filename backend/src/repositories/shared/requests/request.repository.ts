import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../../domain/request/request.constants.js";
import type { UserRole } from "../../../domain/user/user.types.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import { requestSummarySelect } from "../../../serializers/shared/request-summary.serializer.js";

export type RequestCreateInput = {
  requestNumber: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  createdById: string;
  metadata?: Record<string, unknown> | undefined;
  submittedAt?: Date | undefined;
};

export type RequestUpdateInput = {
  title?: string;
  description?: string;
  category?: RequestCategory;
  priority?: RequestPriority;
  metadata?: Record<string, unknown>;
  status?: RequestStatus;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  submittedAt?: Date | null;
  deletedAt?: Date | null;
};

export type RequestListFilters = {
  search?: string | undefined;
  status?: RequestStatus | undefined;
  category?: RequestCategory | undefined;
  priority?: RequestPriority | undefined;
  createdFrom?: Date | undefined;
  createdTo?: Date | undefined;
  sortBy?: "createdAt" | "updatedAt" | "submittedAt" | "priority" | "title";
  sortDirection?: "asc" | "desc";
  skip: number;
  take: number;
};

type RequestWhereInput = {
  id?: string;
  deletedAt?: null;
  createdById?: string | { in: string[] };
  status?: RequestStatus;
  category?: RequestCategory;
  priority?: RequestPriority;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  OR?: Array<{
    title?: { contains: string; mode: "insensitive" };
    description?: { contains: string; mode: "insensitive" };
    requestNumber?: { contains: string; mode: "insensitive" };
  }>;
};

type RequestOrderByInput = Partial<
  Record<NonNullable<RequestListFilters["sortBy"]>, "asc" | "desc">
>;

type RequestDelegate = {
  create(args: {
    data: RequestCreateInput;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord>;
  findMany(args: {
    where: RequestWhereInput;
    orderBy: RequestOrderByInput;
    skip: number;
    take: number;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord[]>;
  count(args: { where: RequestWhereInput }): Promise<number>;
  findFirst(args: {
    where: RequestWhereInput & { id: string };
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord | null>;
  update(args: {
    where: { id: string };
    data: RequestUpdateInput;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord>;
};

type UserDelegate = {
  findMany(args: {
    where: { managerId: string; isActive: true };
    select: { id: true };
  }): Promise<Array<{ id: string }>>;
};

export type RequestRepositoryClient = {
  request: RequestDelegate;
  user: UserDelegate;
};

export type RequestScopeActor = {
  id: string;
  role: UserRole;
};

export async function createRequestRecord(
  prisma: RequestRepositoryClient,
  input: RequestCreateInput,
): Promise<RequestSummaryRecord> {
  return prisma.request.create({
    data: input,
    select: requestSummarySelect,
  });
}

export async function listVisibleRequests(
  prisma: RequestRepositoryClient,
  actor: RequestScopeActor,
  filters: RequestListFilters,
): Promise<{ requests: RequestSummaryRecord[]; total: number }> {
  const where = await buildVisibleRequestWhere(prisma, actor, filters);
  const orderBy = buildRequestOrderBy(filters);

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      orderBy,
      skip: filters.skip,
      take: filters.take,
      select: requestSummarySelect,
    }),
    prisma.request.count({ where }),
  ]);

  return { requests, total };
}

export async function findVisibleRequestById(
  prisma: RequestRepositoryClient,
  actor: RequestScopeActor,
  id: string,
): Promise<RequestSummaryRecord | null> {
  const where = await buildVisibleRequestWhere(prisma, actor, {});

  return prisma.request.findFirst({
    where: {
      ...where,
      id,
    },
    select: requestSummarySelect,
  });
}

export async function findOwnedRequestById(
  prisma: RequestRepositoryClient,
  actorId: string,
  id: string,
): Promise<RequestSummaryRecord | null> {
  return prisma.request.findFirst({
    where: {
      id,
      createdById: actorId,
      deletedAt: null,
    },
    select: requestSummarySelect,
  });
}

export async function updateRequestRecord(
  prisma: RequestRepositoryClient,
  id: string,
  data: RequestUpdateInput,
): Promise<RequestSummaryRecord> {
  return prisma.request.update({
    where: {
      id,
    },
    data,
    select: requestSummarySelect,
  });
}

async function buildVisibleRequestWhere(
  prisma: RequestRepositoryClient,
  actor: RequestScopeActor,
  filters: Partial<RequestListFilters>,
): Promise<RequestWhereInput> {
  const scopeWhere = await buildScopeWhere(prisma, actor);
  const where: RequestWhereInput = {
    deletedAt: null,
    ...scopeWhere,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {};

    if (filters.createdFrom) {
      where.createdAt.gte = filters.createdFrom;
    }

    if (filters.createdTo) {
      where.createdAt.lte = filters.createdTo;
    }
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { requestNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

async function buildScopeWhere(
  prisma: RequestRepositoryClient,
  actor: RequestScopeActor,
): Promise<Pick<RequestWhereInput, "createdById">> {
  if (actor.role === "ADMIN") {
    return {};
  }

  if (actor.role === "MANAGER") {
    const reports = await prisma.user.findMany({
      where: {
        managerId: actor.id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    return {
      createdById: {
        in: [actor.id, ...reports.map((report) => report.id)],
      },
    };
  }

  return {
    createdById: actor.id,
  };
}

function buildRequestOrderBy(
  filters: Partial<RequestListFilters>,
): RequestOrderByInput {
  return {
    [filters.sortBy ?? "createdAt"]: filters.sortDirection ?? "desc",
  };
}
