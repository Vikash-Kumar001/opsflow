import type { EmployeeDashboardResult } from "../../../services/employee/dashboard/get-employee-dashboard.service.js";
import {
  serializeRequestSummary,
  type SerializedRequestSummary,
} from "../../shared/request-summary.serializer.js";

export type SerializedEmployeeDashboard = {
  metrics: EmployeeDashboardResult["metrics"];
  recentRequests: SerializedRequestSummary[];
};

export function serializeEmployeeDashboard(
  dashboard: EmployeeDashboardResult,
): SerializedEmployeeDashboard {
  return {
    metrics: dashboard.metrics,
    recentRequests: dashboard.recentRequests.map(serializeRequestSummary),
  };
}
