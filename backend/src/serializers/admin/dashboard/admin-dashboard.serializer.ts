import {
  serializeAuditLog,
  type SerializedAuditLog,
} from "../audit/admin-audit.serializer.js";
import type { AdminDashboardResult } from "../../../services/admin/dashboard/get-admin-dashboard.service.js";
import {
  serializeRequestSummary,
  type SerializedRequestSummary,
} from "../../shared/request-summary.serializer.js";

export type SerializedAdminDashboard = {
  metrics: AdminDashboardResult["metrics"];
  requestTrendDays: number;
  recentRequestTrend: AdminDashboardResult["recentRequestTrend"];
  recentActivity: SerializedAuditLog[];
  recentRequests: SerializedRequestSummary[];
};

export function serializeAdminDashboard(
  dashboard: AdminDashboardResult,
): SerializedAdminDashboard {
  return {
    metrics: dashboard.metrics,
    requestTrendDays: dashboard.requestTrendDays,
    recentRequestTrend: dashboard.recentRequestTrend,
    recentActivity: dashboard.recentActivity.map(serializeAuditLog),
    recentRequests: dashboard.recentRequests.map(serializeRequestSummary),
  };
}
