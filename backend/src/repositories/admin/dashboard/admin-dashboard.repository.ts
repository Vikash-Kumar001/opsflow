import type {
  RequestCategory,
  RequestStatus,
} from "../../../domain/request/request.constants.js";
import type { UserRole } from "../../../domain/user/user.types.js";
import {
  auditLogSelect,
  type AuditLogRecord,
} from "../audit/admin-audit.repository.js";
import {
  requestSummarySelect,
  type RequestSummaryRecord,
} from "../../../serializers/shared/request-summary.serializer.js";

type UserWhereInput = {
  isActive?: boolean;
};

type RequestWhereInput = {
  deletedAt: null;
  status?: RequestStatus;
  category?: RequestCategory;
  createdAt?: {
    gte?: Date;
    lt?: Date;
  };
};

type UserRoleCountRecord = {
  role: UserRole;
  _count: { role: number };
};

type RequestStatusCountRecord = {
  status: RequestStatus;
  _count: { status: number };
};

type RequestCategoryCountRecord = {
  category: RequestCategory;
  _count: { category: number };
};

type AdminDashboardUserDelegate = {
  count(args?: { where?: UserWhereInput }): Promise<number>;
  groupBy(args: {
    by: ["role"];
    _count: { role: true };
  }): Promise<UserRoleCountRecord[]>;
};

type AdminDashboardRequestDelegate = {
  count(args?: { where?: RequestWhereInput }): Promise<number>;
  groupBy(args: {
    by: ["status"] | ["category"];
    where: RequestWhereInput;
    _count: { status?: true; category?: true };
  }): Promise<RequestStatusCountRecord[] | RequestCategoryCountRecord[]>;
  findMany(args: {
    where: RequestWhereInput;
    orderBy: { createdAt: "desc" };
    take: number;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord[]>;
};

type AdminDashboardAuditLogDelegate = {
  findMany(args: {
    orderBy: { createdAt: "desc" };
    take: number;
    select: typeof auditLogSelect;
  }): Promise<AuditLogRecord[]>;
};

export type AdminDashboardRepositoryClient = {
  user: AdminDashboardUserDelegate;
  request: AdminDashboardRequestDelegate;
  auditLog: AdminDashboardAuditLogDelegate;
};

export async function countAllUsers(
  prisma: AdminDashboardRepositoryClient,
): Promise<number> {
  return prisma.user.count();
}

export async function countActiveUsers(
  prisma: AdminDashboardRepositoryClient,
): Promise<number> {
  return prisma.user.count({ where: { isActive: true } });
}

export async function countUsersByRole(
  prisma: AdminDashboardRepositoryClient,
): Promise<UserRoleCountRecord[]> {
  return prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });
}

export async function countAllRequests(
  prisma: AdminDashboardRepositoryClient,
): Promise<number> {
  return prisma.request.count({ where: { deletedAt: null } });
}

export async function countRequestsByStatus(
  prisma: AdminDashboardRepositoryClient,
): Promise<RequestStatusCountRecord[]> {
  return prisma.request.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { status: true },
  }) as Promise<RequestStatusCountRecord[]>;
}

export async function countRequestsByCategory(
  prisma: AdminDashboardRepositoryClient,
): Promise<RequestCategoryCountRecord[]> {
  return prisma.request.groupBy({
    by: ["category"],
    where: { deletedAt: null },
    _count: { category: true },
  }) as Promise<RequestCategoryCountRecord[]>;
}

export async function countRequestsCreatedBetween(
  prisma: AdminDashboardRepositoryClient,
  start: Date,
  end: Date,
): Promise<number> {
  return prisma.request.count({
    where: {
      deletedAt: null,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });
}

export async function listRecentAdminRequests(
  prisma: AdminDashboardRepositoryClient,
  take: number,
): Promise<RequestSummaryRecord[]> {
  return prisma.request.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
    select: requestSummarySelect,
  });
}

export async function listRecentAdminActivity(
  prisma: AdminDashboardRepositoryClient,
  take: number,
): Promise<AuditLogRecord[]> {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: auditLogSelect,
  });
}
