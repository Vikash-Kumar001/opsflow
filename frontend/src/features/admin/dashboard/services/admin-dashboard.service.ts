import { apiRequest } from "@/lib/api/api-client";

import type { AdminDashboardData } from "../types/admin-dashboard.types";

export function getAdminDashboard(): Promise<AdminDashboardData> {
  return apiRequest<AdminDashboardData>("/admin/dashboard");
}
