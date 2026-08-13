import {
  REQUEST_CATEGORIES,
  REQUEST_STATUSES,
  type RequestCategory,
  type RequestStatus,
} from "../../../domain/request/request.constants.js";
import { USER_ROLES, type UserRole } from "../../../domain/user/user.types.js";
import {
  countActiveUsers,
  countAllRequests,
  countAllUsers,
  countRequestsByCategory,
  countRequestsByStatus,
  countRequestsCreatedBetween,
  countUsersByRole,
  listRecentAdminActivity,
  listRecentAdminRequests,
  type AdminDashboardRepositoryClient,
} from "../../../repositories/admin/dashboard/admin-dashboard.repository.js";
import type { AuditLogRecord } from "../../../repositories/admin/audit/admin-audit.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";

const RECENT_REQUEST_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 8;
const REQUEST_TREND_DAYS = 7;

export type CountByUserRole = Record<UserRole, number>;
export type CountByRequestStatus = Record<RequestStatus, number>;
export type CountByRequestCategory = Record<RequestCategory, number>;

export type RequestTrendPoint = {
  date: string;
  count: number;
};

export type AdminDashboardResult = {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    roleCounts: CountByUserRole;
    totalRequests: number;
    statusCounts: CountByRequestStatus;
    categoryCounts: CountByRequestCategory;
  };
  requestTrendDays: number;
  recentRequestTrend: RequestTrendPoint[];
  recentActivity: AuditLogRecord[];
  recentRequests: RequestSummaryRecord[];
};

export async function getAdminDashboard(
  prisma: AdminDashboardRepositoryClient,
): Promise<AdminDashboardResult> {
  const trendDays = buildRecentUtcDays(REQUEST_TREND_DAYS);

  const [
    totalUsers,
    activeUsers,
    roleCountRows,
    totalRequests,
    statusCountRows,
    categoryCountRows,
    recentActivity,
    recentRequests,
    ...trendCounts
  ] = await Promise.all([
    countAllUsers(prisma),
    countActiveUsers(prisma),
    countUsersByRole(prisma),
    countAllRequests(prisma),
    countRequestsByStatus(prisma),
    countRequestsByCategory(prisma),
    listRecentAdminActivity(prisma, RECENT_ACTIVITY_LIMIT),
    listRecentAdminRequests(prisma, RECENT_REQUEST_LIMIT),
    ...trendDays.map((day) =>
      countRequestsCreatedBetween(prisma, day.start, day.end),
    ),
  ]);

  return {
    metrics: {
      totalUsers,
      activeUsers,
      roleCounts: buildRoleCounts(roleCountRows),
      totalRequests,
      statusCounts: buildStatusCounts(statusCountRows),
      categoryCounts: buildCategoryCounts(categoryCountRows),
    },
    requestTrendDays: REQUEST_TREND_DAYS,
    recentRequestTrend: trendDays.map((day, index) => ({
      date: day.date,
      count: trendCounts[index] ?? 0,
    })),
    recentActivity,
    recentRequests,
  };
}

function buildRoleCounts(
  rows: Array<{ role: UserRole; _count: { role: number } }>,
): CountByUserRole {
  const counts = Object.fromEntries(
    USER_ROLES.map((role) => [role, 0]),
  ) as CountByUserRole;

  for (const row of rows) {
    counts[row.role] = row._count.role;
  }

  return counts;
}

function buildStatusCounts(
  rows: Array<{ status: RequestStatus; _count: { status: number } }>,
): CountByRequestStatus {
  const counts = Object.fromEntries(
    REQUEST_STATUSES.map((status) => [status, 0]),
  ) as CountByRequestStatus;

  for (const row of rows) {
    counts[row.status] = row._count.status;
  }

  return counts;
}

function buildCategoryCounts(
  rows: Array<{ category: RequestCategory; _count: { category: number } }>,
): CountByRequestCategory {
  const counts = Object.fromEntries(
    REQUEST_CATEGORIES.map((category) => [category, 0]),
  ) as CountByRequestCategory;

  for (const row of rows) {
    counts[row.category] = row._count.category;
  }

  return counts;
}

function buildRecentUtcDays(
  count: number,
): Array<{ date: string; start: Date; end: Date }> {
  const now = new Date();
  const todayStart = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1;
    const start = new Date(todayStart - offset * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    return {
      date: start.toISOString().slice(0, 10),
      start,
      end,
    };
  });
}
