import { apiRequest } from "@/lib/api/api-client";

import type { ManagerDashboardData } from "../types/manager-dashboard.types";

export function getManagerDashboard(): Promise<ManagerDashboardData> {
  return apiRequest<ManagerDashboardData>("/manager/dashboard");
}
