import { apiRequest } from "@/lib/api/api-client";

import type { EmployeeDashboardData } from "../types/employee-dashboard.types";

export function getEmployeeDashboard(): Promise<EmployeeDashboardData> {
  return apiRequest<EmployeeDashboardData>("/employee/dashboard");
}
