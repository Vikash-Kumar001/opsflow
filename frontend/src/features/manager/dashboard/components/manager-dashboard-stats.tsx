import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  Clock3Icon,
  XCircleIcon,
} from "lucide-react";

import { StatCard } from "@/components/shared";

import type { ManagerDashboardMetrics } from "../types/manager-dashboard.types";

type ManagerDashboardStatsProps = {
  metrics: ManagerDashboardMetrics;
  recentPeriodDays: number;
};

export function ManagerDashboardStats({
  metrics,
  recentPeriodDays,
}: ManagerDashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Pending approvals"
        value={metrics.pendingApprovals}
        description="Ready for manager review"
        icon={ClipboardListIcon}
      />
      <StatCard
        label="In review"
        value={metrics.inReview}
        description="Currently under review"
        icon={Clock3Icon}
      />
      <StatCard
        label="Approved"
        value={metrics.approvedRecent}
        description={`Last ${recentPeriodDays} days`}
        icon={CheckCircle2Icon}
      />
      <StatCard
        label="Rejected"
        value={metrics.rejectedRecent}
        description={`Last ${recentPeriodDays} days`}
        icon={XCircleIcon}
      />
      <StatCard
        label="Urgent"
        value={metrics.urgentRequests}
        description="Team requests marked urgent"
        icon={AlertTriangleIcon}
      />
    </div>
  );
}
