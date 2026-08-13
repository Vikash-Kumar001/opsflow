import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../../domain/request/request.constants.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import { requestSummarySelect } from "../../../serializers/shared/request-summary.serializer.js";
import type { RequestListFilters } from "../../shared/requests/request.repository.js";

type AdminRequestWhereInput = {
  id?: string;
  deletedAt?: null;
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

type AdminRequestOrderByInput = Partial<
  Record<NonNullable<RequestListFilters["sortBy"]>, "asc" | "desc">
>;

type AdminRequestUpdateInput = {
  deletedAt?: Date | null;
};

type AdminRequestDelegate = {
  findMany(args: {
    where: AdminRequestWhereInput;
    orderBy: AdminRequestOrderByInput;
    skip: number;
    take: number;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord[]>;
  count(args: { where: AdminRequestWhereInput }): Promise<number>;
  findFirst(args: {
    where: AdminRequestWhereInput & { id: string };
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord | null>;
  update(args: {
    where: { id: string };
    data: AdminRequestUpdateInput;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord>;
};

export type AdminRequestRepositoryClient = {
  request: AdminRequestDelegate;
};

export async function listAdminRequests(
  prisma: AdminRequestRepositoryClient,
  filters: RequestListFilters,
): Promise<{ requests: RequestSummaryRecord[]; total: number }> {
  const where = buildAdminRequestWhere(filters);
  const orderBy = buildAdminRequestOrderBy(filters);

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

export async function findAdminRequestById(
  prisma: AdminRequestRepositoryClient,
  id: string,
): Promise<RequestSummaryRecord | null> {
  return prisma.request.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: requestSummarySelect,
  });
}

export async function softDeleteAdminRequest(
  prisma: AdminRequestRepositoryClient,
  id: string,
  deletedAt: Date,
): Promise<RequestSummaryRecord> {
  return prisma.request.update({
    where: {
      id,
    },
    data: {
      deletedAt,
    },
    select: requestSummarySelect,
  });
}

function buildAdminRequestWhere(
  filters: Partial<RequestListFilters>,
): AdminRequestWhereInput {
  const where: AdminRequestWhereInput = {
    deletedAt: null,
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

function buildAdminRequestOrderBy(
  filters: Partial<RequestListFilters>,
): AdminRequestOrderByInput {
  return {
    [filters.sortBy ?? "createdAt"]: filters.sortDirection ?? "desc",
  };
}
