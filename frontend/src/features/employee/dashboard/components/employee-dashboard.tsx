"use client";

import Link from "next/link";

import { EmptyState, ErrorState, PageHeader } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";

import { EmployeeDashboardSkeleton } from "./employee-dashboard-skeleton";
import { EmployeeDashboardStats } from "./employee-dashboard-stats";
import { EmployeeQuickActions } from "./employee-quick-actions";
import { EmployeeRecentRequests } from "./employee-recent-requests";
import { useEmployeeDashboard } from "../hooks/use-employee-dashboard";

export function EmployeeDashboard() {
  const dashboardQuery = useEmployeeDashboard();

  if (dashboardQuery.isLoading) {
    return <EmployeeDashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Employee workspace"
          title="Employee dashboard"
          description="Track your requests, review recent decisions, and start new approval workflows."
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
    return <EmployeeDashboardSkeleton />;
  }

  const hasRequests = dashboard.metrics.totalRequests > 0;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Employee workspace"
        title="Employee dashboard"
        description="Track your requests, review recent decisions, and start new approval workflows."
        actions={
          <Link
            className={buttonVariants()}
            href="/employee/requests/new"
          >
            New request
          </Link>
        }
      />

      {!hasRequests ? (
        <EmptyState
          title="No requests yet"
          description="Create your first request to start tracking approvals and decisions in OpsFlow."
          action={
            <Link
              className={buttonVariants()}
              href="/employee/requests/new"
            >
              New request
            </Link>
          }
        />
      ) : (
        <>
          <EmployeeDashboardStats metrics={dashboard.metrics} />
          <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
            <EmployeeRecentRequests requests={dashboard.recentRequests} />
            <EmployeeQuickActions />
          </div>
        </>
      )}
    </section>
  );
}
