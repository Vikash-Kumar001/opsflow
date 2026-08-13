"use client";

import Link from "next/link";

import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  StatCard,
} from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import type { RequestStatus } from "@/features/shared/requests";

import { ManagerRequestListCards } from "./manager-request-list-cards";
import { ManagerRequestListFilters } from "./manager-request-list-filters";
import { ManagerRequestListSkeleton } from "./manager-request-list-skeleton";
import { ManagerRequestListTable } from "./manager-request-list-table";
import { useManagerRequestListQueryState } from "../hooks/use-manager-request-list-query-state";
import { useManagerTeamRequests } from "../hooks/use-manager-team-requests";

type ManagerRequestListProps = {
  variant: "team" | "queue";
};

const APPROVAL_QUEUE_STATUSES = ["PENDING", "IN_REVIEW"] as const;

export function ManagerRequestList({ variant }: ManagerRequestListProps) {
  const isQueue = variant === "queue";
  const statusOptions: readonly RequestStatus[] = isQueue
    ? APPROVAL_QUEUE_STATUSES
    : ["DRAFT", "PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "CANCELLED"];
  const queryState = useManagerRequestListQueryState({
    defaultStatus: isQueue ? "PENDING" : undefined,
    allowedStatuses: statusOptions,
  });
  const requestsQuery = useManagerTeamRequests(queryState.params);
  const copy = isQueue ? queueCopy : teamCopy;

  if (requestsQuery.isLoading) {
    return <ManagerRequestListSkeleton />;
  }

  if (requestsQuery.isError) {
    return (
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Manager workspace"
          title={copy.title}
          description={copy.description}
        />
        <ErrorState
          message={requestsQuery.error.message}
          onRetry={() => void requestsQuery.refetch()}
        />
      </section>
    );
  }

  const data = requestsQuery.data;

  if (!data) {
    return <ManagerRequestListSkeleton />;
  }

  const hasResults = data.requests.length > 0;
  const hasAnyQuery = queryState.hasActiveFilters;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Manager workspace"
        title={copy.title}
        description={copy.description}
        actions={
          isQueue ? (
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/manager/requests"
            >
              Team requests
            </Link>
          ) : (
            <Link
              className={buttonVariants()}
              href="/manager/approvals"
            >
              Approval queue
            </Link>
          )
        }
      />

      <ManagerRequestListFilters
        params={queryState.params}
        searchDraft={queryState.searchDraft}
        isSearching={requestsQuery.isFetching && !requestsQuery.isLoading}
        statusOptions={statusOptions}
        hasActiveFilters={queryState.hasActiveFilters}
        onSearchChange={queryState.setSearchDraft}
        onParamsChange={queryState.updateParams}
        onClearFilters={queryState.clearFilters}
      />

      {isQueue ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Queue focus"
            value={queryState.params.status === "IN_REVIEW" ? "In review" : "Pending"}
            description="Server-scoped manager review items"
          />
          <StatCard
            label="Visible requests"
            value={data.pagination.total}
            description="Matching current queue filters"
          />
          <StatCard
            label="Page size"
            value={data.pagination.limit}
            description="Requests loaded from the API"
          />
        </div>
      ) : null}

      {hasResults ? (
        <>
          <ManagerRequestListTable
            requests={data.requests}
            label={copy.tableLabel}
          />
          <ManagerRequestListCards requests={data.requests} />
          <Pagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            onPageChange={(page) => queryState.updateParams({ page })}
          />
        </>
      ) : (
        <EmptyState
          title={hasAnyQuery ? copy.noMatchTitle : copy.emptyTitle}
          description={
            hasAnyQuery ? copy.noMatchDescription : copy.emptyDescription
          }
          action={
            hasAnyQuery ? (
              <button
                className={buttonVariants({ variant: "outline" })}
                type="button"
                onClick={queryState.clearFilters}
              >
                Clear filters
              </button>
            ) : isQueue ? (
              <Link
                className={buttonVariants({ variant: "outline" })}
                href="/manager/requests"
              >
                Team requests
              </Link>
            ) : null
          }
        />
      )}
    </section>
  );
}

const teamCopy = {
  title: "Team requests",
  description:
    "Search, filter, sort, and review requests submitted by your direct reports.",
  tableLabel: "Team requests",
  emptyTitle: "No team requests yet",
  emptyDescription:
    "Requests from employees assigned to you will appear here after they are created.",
  noMatchTitle: "No matching team requests",
  noMatchDescription:
    "Clear filters or adjust your search to see more team requests.",
};

const queueCopy = {
  title: "Approval queue",
  description:
    "Focus on team requests that are waiting for review or already in review.",
  tableLabel: "Approval queue",
  emptyTitle: "You're all caught up",
  emptyDescription:
    "There are no pending requests waiting for approval in your team queue.",
  noMatchTitle: "No matching approval requests",
  noMatchDescription:
    "Clear filters or switch between pending and in-review requests.",
};
