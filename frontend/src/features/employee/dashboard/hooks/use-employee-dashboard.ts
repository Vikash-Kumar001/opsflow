"use client";

import { useQuery } from "@tanstack/react-query";

import { getEmployeeDashboard } from "../services/employee-dashboard.service";

export const employeeDashboardQueryKeys = {
  dashboard: ["employee", "dashboard"] as const,
};

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: employeeDashboardQueryKeys.dashboard,
    queryFn: getEmployeeDashboard,
  });
}
