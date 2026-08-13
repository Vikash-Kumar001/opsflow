import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge } from "@/features/shared/requests";

import type {
  ManagerDashboardMetrics,
  TeamDashboardRequest,
} from "../types/manager-dashboard.types";

type TeamStatusSummaryProps = {
  metrics: ManagerDashboardMetrics;
  recentTeamRequests: TeamDashboardRequest[];
};

export function TeamStatusSummary({
  metrics,
  recentTeamRequests,
}: TeamStatusSummaryProps) {
  const statusRows = [
    {
      status: "PENDING" as const,
      label: "Pending",
      value: metrics.pendingApprovals,
    },
    { status: "IN_REVIEW" as const, label: "In review", value: metrics.inReview },
    {
      status: "APPROVED" as const,
      label: "Approved recent",
      value: metrics.approvedRecent,
    },
    {
      status: "REJECTED" as const,
      label: "Rejected recent",
      value: metrics.rejectedRecent,
    },
  ];
  const total = statusRows.reduce((sum, row) => sum + row.value, 0);
  const urgentVisibleCount = recentTeamRequests.filter(
    (request) => request.priority === "URGENT",
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusRows.map((row) => {
          const width = total > 0 ? Math.max((row.value / total) * 100, 4) : 0;

          return (
            <div key={row.status} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <RequestStatusBadge value={row.status} />
                <span className="text-sm font-medium text-foreground">
                  {row.value}
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-muted"
                aria-label={`${row.label}: ${row.value}`}
              >
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="text-sm text-muted-foreground">
          {metrics.urgentRequests} urgent team requests. {urgentVisibleCount} are
          visible in the recent queue.
        </p>
      </CardContent>
    </Card>
  );
}
