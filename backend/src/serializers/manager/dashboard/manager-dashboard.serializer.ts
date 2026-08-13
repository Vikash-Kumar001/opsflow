import {
  serializeTeamRequest,
  type SerializedTeamRequest,
} from "../requests/team-request-response.serializer.js";
import type { ManagerDashboardResult } from "../../../services/manager/dashboard/get-manager-dashboard.service.js";

export type SerializedManagerDashboard = {
  metrics: ManagerDashboardResult["metrics"];
  recentPeriodDays: number;
  recentTeamRequests: SerializedTeamRequest[];
};

export function serializeManagerDashboard(
  dashboard: ManagerDashboardResult,
): SerializedManagerDashboard {
  return {
    metrics: dashboard.metrics,
    recentPeriodDays: dashboard.recentPeriodDays,
    recentTeamRequests: dashboard.recentTeamRequests.map(serializeTeamRequest),
  };
}
