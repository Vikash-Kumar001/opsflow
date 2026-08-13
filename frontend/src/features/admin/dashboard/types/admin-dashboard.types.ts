import type { Role } from "@/features/auth/types/auth.types";
import type { AdminAuditLog } from "@/features/admin/audit/types/admin-audit.types";
import type {
  RequestCategory,
  RequestStatus,
  RequestSummary,
} from "@/features/shared/requests";

export type AdminDashboardMetrics = {
  totalUsers: number;
  activeUsers: number;
  roleCounts: Record<Role, number>;
  totalRequests: number;
  statusCounts: Record<RequestStatus, number>;
  categoryCounts: Record<RequestCategory, number>;
};

export type AdminRequestTrendPoint = {
  date: string;
  count: number;
};

export type AdminDashboardData = {
  metrics: AdminDashboardMetrics;
  requestTrendDays: number;
  recentRequestTrend: AdminRequestTrendPoint[];
  recentActivity: AdminAuditLog[];
  recentRequests: RequestSummary[];
};
