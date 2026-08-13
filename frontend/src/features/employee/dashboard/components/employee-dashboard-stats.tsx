import {
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  XCircleIcon,
} from "lucide-react";

import { StatCard } from "@/components/shared";

import type { EmployeeDashboardMetrics } from "../types/employee-dashboard.types";

type EmployeeDashboardStatsProps = {
  metrics: EmployeeDashboardMetrics;
};

export function EmployeeDashboardStats({
  metrics,
}: EmployeeDashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total requests"
        value={metrics.totalRequests}
        description={`${metrics.draftRequests} draft`}
        icon={FileTextIcon}
      />
      <StatCard
        label="Awaiting review"
        value={metrics.pendingRequests}
        description={`${metrics.inReviewRequests} in review`}
        icon={Clock3Icon}
      />
      <StatCard
        label="Approved"
        value={metrics.approvedRequests}
        description="Completed approvals"
        icon={CheckCircle2Icon}
      />
      <StatCard
        label="Rejected"
        value={metrics.rejectedRequests}
        description={`${metrics.cancelledRequests} cancelled`}
        icon={XCircleIcon}
      />
    </div>
  );
}
