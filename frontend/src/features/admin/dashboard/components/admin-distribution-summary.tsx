import type { Role } from "@/features/auth/types/auth.types";
import type {
  RequestCategory,
  RequestStatus,
} from "@/features/shared/requests";
import {
  REQUEST_CATEGORY_LABELS,
  REQUEST_STATUS_LABELS,
} from "@/features/shared/requests";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AdminDashboardMetrics } from "../types/admin-dashboard.types";
import { ROLE_LABELS } from "../utils/admin-dashboard-labels";

type AdminDistributionSummaryProps = {
  metrics: AdminDashboardMetrics;
};

type DistributionRow<TValue extends string> = {
  value: TValue;
  label: string;
  count: number;
};

export function AdminDistributionSummary({
  metrics,
}: AdminDistributionSummaryProps) {
  const statusRows = (Object.entries(REQUEST_STATUS_LABELS) as Array<
    [RequestStatus, string]
  >).map(([status, label]) => ({
    value: status,
    label,
    count: metrics.statusCounts[status],
  }));

  const categoryRows = (Object.entries(REQUEST_CATEGORY_LABELS) as Array<
    [RequestCategory, string]
  >).map(([category, label]) => ({
    value: category,
    label,
    count: metrics.categoryCounts[category],
  }));

  const roleRows = (Object.entries(ROLE_LABELS) as Array<[Role, string]>).map(
    ([role, label]) => ({
      value: role,
      label,
      count: metrics.roleCounts[role],
    }),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <DistributionCard
        title="Request status"
        rows={statusRows}
        total={metrics.totalRequests}
        ariaLabel="Request status distribution"
      />
      <DistributionCard
        title="Request category"
        rows={categoryRows}
        total={metrics.totalRequests}
        ariaLabel="Request category distribution"
      />
      <DistributionCard
        title="User roles"
        rows={roleRows}
        total={metrics.totalUsers}
        ariaLabel="User role distribution"
      />
    </div>
  );
}

type DistributionCardProps<TValue extends string> = {
  title: string;
  rows: Array<DistributionRow<TValue>>;
  total: number;
  ariaLabel: string;
};

function DistributionCard<TValue extends string>({
  title,
  rows,
  total,
  ariaLabel,
}: DistributionCardProps<TValue>) {
  const visibleRows = rows.filter((row) => row.count > 0);
  const displayRows = visibleRows.length > 0 ? visibleRows : rows;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" role="list" aria-label={ariaLabel}>
        {displayRows.map((row) => {
          const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;
          const width = row.count > 0 ? Math.max(percent, 4) : 0;

          return (
            <div key={row.value} className="space-y-2" role="listitem">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {row.label}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {row.count} ({percent}%)
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-muted"
                aria-label={`${row.label}: ${row.count}, ${percent}%`}
              >
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
