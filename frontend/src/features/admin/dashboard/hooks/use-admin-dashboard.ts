"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "../services/admin-dashboard.service";

export const adminDashboardQueryKeys = {
  dashboard: ["admin", "dashboard"] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard,
    queryFn: getAdminDashboard,
  });
}
