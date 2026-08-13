import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../../domain/request/request.constants.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import { requestSummarySelect } from "../../../serializers/shared/request-summary.serializer.js";
import type { RequestListFilters } from "../../shared/requests/request.repository.js";

type ManagerTeamRequestWhereInput = {
  id?: string;
  deletedAt?: null;
  NOT?: {
    createdById: string;
  };
  createdBy: {
    managerId: string;
  };
  status?: RequestStatus;
  category?: RequestCategory;
  priority?: RequestPriority;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  reviewedAt?: {
    gte?: Date;
  };
  OR?: Array<{
    title?: { contains: string; mode: "insensitive" };
    description?: { contains: string; mode: "insensitive" };
    requestNumber?: { contains: string; mode: "insensitive" };
  }>;
};

type ManagerTeamRequestOrderByInput = Partial<
  Record<NonNullable<RequestListFilters["sortBy"]>, "asc" | "desc">
>;

type ManagerTeamRequestFilters = Partial<RequestListFilters> & {
  reviewedFrom?: Date | undefined;
};

type ManagerTeamRequestDelegate = {
  findMany(args: {
    where: ManagerTeamRequestWhereInput;
    orderBy: ManagerTeamRequestOrderByInput;
    skip: number;
    take: number;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord[]>;
  count(args: { where: ManagerTeamRequestWhereInput }): Promise<number>;
  findFirst(args: {
    where: ManagerTeamRequestWhereInput & { id: string };
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord | null>;
  updateMany(args: {
    where: ManagerTeamRequestWhereInput & { id: string; status: RequestStatus };
    data: ManagerTeamRequestReviewUpdateInput;
  }): Promise<{ count: number }>;
};

export type ManagerRequestRepositoryClient = {
  request: ManagerTeamRequestDelegate;
};

export type ManagerTeamRequestReviewUpdateInput = {
  status: RequestStatus;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
};

export async function listManagerTeamRequests(
  prisma: ManagerRequestRepositoryClient,
  managerId: string,
  filters: RequestListFilters,
): Promise<{ requests: RequestSummaryRecord[]; total: number }> {
  const where = buildManagerTeamRequestWhere(managerId, filters);
  const orderBy = buildManagerTeamRequestOrderBy(filters);

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

export async function findManagerTeamRequestById(
  prisma: ManagerRequestRepositoryClient,
  managerId: string,
  id: string,
): Promise<RequestSummaryRecord | null> {
  return prisma.request.findFirst({
    where: {
      ...buildManagerTeamRequestWhere(managerId, {}),
      id,
    },
    select: requestSummarySelect,
  });
}

export async function findManagerReviewTargetById(
  prisma: ManagerRequestRepositoryClient,
  managerId: string,
  id: string,
): Promise<RequestSummaryRecord | null> {
  return prisma.request.findFirst({
    where: {
      ...buildManagerTeamRequestWhere(managerId, {}, { excludeSelf: false }),
      id,
    },
    select: requestSummarySelect,
  });
}

export async function updateManagerTeamRequestForReview(
  prisma: ManagerRequestRepositoryClient,
  managerId: string,
  id: string,
  currentStatus: RequestStatus,
  data: ManagerTeamRequestReviewUpdateInput,
): Promise<boolean> {
  const result = await prisma.request.updateMany({
    where: {
      ...buildManagerTeamRequestWhere(managerId, {}),
      id,
      status: currentStatus,
    },
    data,
  });

  return result.count === 1;
}

export async function countManagerTeamRequests(
  prisma: ManagerRequestRepositoryClient,
  managerId: string,
  filters: Partial<RequestListFilters> & {
    status?: RequestStatus;
    priority?: RequestPriority;
    reviewedFrom?: Date | undefined;
  },
): Promise<number> {
  return prisma.request.count({
    where: buildManagerTeamRequestWhere(managerId, filters),
  });
}

export async function listRecentManagerTeamRequests(
  prisma: ManagerRequestRepositoryClient,
  managerId: string,
  take: number,
): Promise<RequestSummaryRecord[]> {
  return prisma.request.findMany({
    where: buildManagerTeamRequestWhere(managerId, {}),
    orderBy: {
      updatedAt: "desc",
    },
    skip: 0,
    take,
    select: requestSummarySelect,
  });
}

function buildManagerTeamRequestWhere(
  managerId: string,
  filters: ManagerTeamRequestFilters,
  options: { excludeSelf: boolean } = { excludeSelf: true },
): ManagerTeamRequestWhereInput {
  const where: ManagerTeamRequestWhereInput = {
    deletedAt: null,
    createdBy: {
      managerId,
    },
  };

  if (options.excludeSelf) {
    where.NOT = {
      createdById: managerId,
    };
  }

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

  if ("reviewedFrom" in filters && filters.reviewedFrom) {
    where.reviewedAt = {
      gte: filters.reviewedFrom,
    };
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

function buildManagerTeamRequestOrderBy(
  filters: Partial<RequestListFilters>,
): ManagerTeamRequestOrderByInput {
  return {
    [filters.sortBy ?? "createdAt"]: filters.sortDirection ?? "desc",
  };
}
