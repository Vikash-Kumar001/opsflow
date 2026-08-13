"use client";

import { useQuery } from "@tanstack/react-query";

import { getManagerDashboard } from "../services/manager-dashboard.service";

export const managerDashboardQueryKeys = {
  dashboard: ["manager", "dashboard"] as const,
};

export function useManagerDashboard() {
  return useQuery({
    queryKey: managerDashboardQueryKeys.dashboard,
    queryFn: getManagerDashboard,
  });
}
