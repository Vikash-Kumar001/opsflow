import {
  CheckCircle2Icon,
  Clock3Icon,
  ShieldCheckIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";

import { StatCard } from "@/components/shared";

import type { AdminDashboardMetrics } from "../types/admin-dashboard.types";

type AdminDashboardStatsProps = {
  metrics: AdminDashboardMetrics;
};

export function AdminDashboardStats({ metrics }: AdminDashboardStatsProps) {
  const activeUserPercent =
    metrics.totalUsers > 0
      ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100)
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Total users"
        value={metrics.totalUsers}
        description={`${metrics.activeUsers} active (${activeUserPercent}%)`}
        icon={UsersIcon}
      />
      <StatCard
        label="Total requests"
        value={metrics.totalRequests}
        description="Organization-wide request volume"
        icon={WorkflowIcon}
      />
      <StatCard
        label="Pending"
        value={metrics.statusCounts.PENDING}
        description="Awaiting review"
        icon={Clock3Icon}
      />
      <StatCard
        label="In review"
        value={metrics.statusCounts.IN_REVIEW}
        description="Review currently underway"
        icon={ShieldCheckIcon}
      />
      <StatCard
        label="Approved"
        value={metrics.statusCounts.APPROVED}
        description={`${metrics.statusCounts.REJECTED} rejected`}
        icon={CheckCircle2Icon}
      />
    </div>
  );
}
