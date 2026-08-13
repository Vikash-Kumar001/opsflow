"use client";

import Link from "next/link";

import { EmptyState, ErrorState, PageHeader } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";

import { ManagerDashboardSkeleton } from "./manager-dashboard-skeleton";
import { ManagerDashboardStats } from "./manager-dashboard-stats";
import { ManagerRecentTeamRequests } from "./manager-recent-team-requests";
import { TeamStatusSummary } from "./team-status-summary";
import { useManagerDashboard } from "../hooks/use-manager-dashboard";

export function ManagerDashboard() {
  const dashboardQuery = useManagerDashboard();

  if (dashboardQuery.isLoading) {
    return <ManagerDashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Manager workspace"
          title="Manager dashboard"
          description="Review team requests, watch urgent work, and keep approvals moving."
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
    return <ManagerDashboardSkeleton />;
  }

  const hasTeamActivity =
    dashboard.recentTeamRequests.length > 0 ||
    dashboard.metrics.pendingApprovals > 0 ||
    dashboard.metrics.inReview > 0 ||
    dashboard.metrics.urgentRequests > 0 ||
    dashboard.metrics.approvedRecent > 0 ||
    dashboard.metrics.rejectedRecent > 0;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Manager workspace"
        title="Manager dashboard"
        description="Review team requests, watch urgent work, and keep approvals moving."
        actions={
          <Link
            className={buttonVariants()}
            href="/manager/approvals"
          >
            Approval queue
          </Link>
        }
      />

      {!hasTeamActivity ? (
        <EmptyState
          title="No team activity yet"
          description="Submitted requests from your direct reports will appear here once they need review."
          action={
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/manager/requests"
            >
              Team requests
            </Link>
          }
        />
      ) : (
        <>
          <ManagerDashboardStats
            metrics={dashboard.metrics}
            recentPeriodDays={dashboard.recentPeriodDays}
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
            <ManagerRecentTeamRequests
              requests={dashboard.recentTeamRequests}
            />
            <TeamStatusSummary
              metrics={dashboard.metrics}
              recentTeamRequests={dashboard.recentTeamRequests}
            />
          </div>
        </>
      )}
    </section>
  );
}
