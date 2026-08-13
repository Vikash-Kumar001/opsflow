"use client";

import { EmptyState, ErrorState, PageHeader } from "@/components/shared";

import { AdminDashboardSkeleton } from "./admin-dashboard-skeleton";
import { AdminDashboardStats } from "./admin-dashboard-stats";
import { AdminDistributionSummary } from "./admin-distribution-summary";
import { AdminRecentActivity } from "./admin-recent-activity";
import { AdminRecentRequests } from "./admin-recent-requests";
import { AdminRequestTrendChart } from "./admin-request-trend-chart";
import { useAdminDashboard } from "../hooks/use-admin-dashboard";

export function AdminDashboard() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Admin workspace"
          title="Admin dashboard"
          description="Monitor organization users, request flow, and audited activity."
        />
        <ErrorState
          message={dashboardQuery.error.message}
          onRetry={() => void dashboardQuery.refetch()}
        />
      </section>
    );
  }

  const dashboard = dashboardQuery.data;

  if (!dashboard) {
    return <AdminDashboardSkeleton />;
  }

  const hasOrganizationActivity =
    dashboard.metrics.totalUsers > 0 ||
    dashboard.metrics.totalRequests > 0 ||
    dashboard.recentActivity.length > 0;

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Admin dashboard"
        description="Monitor organization users, request flow, and audited activity."
      />

      {!hasOrganizationActivity ? (
        <EmptyState
          title="No organization activity yet"
          description="Users, requests, and audit events will appear here once the workspace is active."
        />
      ) : (
        <>
          <AdminDashboardStats metrics={dashboard.metrics} />
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <AdminRequestTrendChart
              trend={dashboard.recentRequestTrend}
              days={dashboard.requestTrendDays}
            />
            <AdminRecentActivity activity={dashboard.recentActivity} />
          </div>
          <AdminDistributionSummary metrics={dashboard.metrics} />
          <AdminRecentRequests requests={dashboard.recentRequests} />
        </>
      )}
    </section>
  );
}
