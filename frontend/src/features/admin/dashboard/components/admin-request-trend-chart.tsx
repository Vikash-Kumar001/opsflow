import { format, parseISO } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AdminRequestTrendPoint } from "../types/admin-dashboard.types";

type AdminRequestTrendChartProps = {
  trend: AdminRequestTrendPoint[];
  days: number;
};

export function AdminRequestTrendChart({
  trend,
  days,
}: AdminRequestTrendChartProps) {
  const maxCount = Math.max(...trend.map((point) => point.count), 1);
  const total = trend.reduce((sum, point) => sum + point.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total} requests created over the last {days} days.
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="flex min-h-64 items-end gap-2 overflow-x-auto pb-2"
          role="img"
          aria-label={`Daily request trend over the last ${days} days`}
        >
          {trend.map((point) => {
            const height = point.count > 0 ? Math.max((point.count / maxCount) * 100, 8) : 2;
            const label = format(parseISO(point.date), "MMM d");

            return (
              <div
                key={point.date}
                className="flex min-w-12 flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-foreground">
                  {point.count}
                </span>
                <div className="flex h-40 w-full items-end rounded-md bg-muted px-1">
                  <div
                    className="w-full rounded-sm bg-primary"
                    style={{ height: `${height}%` }}
                    aria-label={`${label}: ${point.count} requests`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
