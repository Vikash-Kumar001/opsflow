"use client";

import Link from "next/link";

import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
} from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";

import { EmployeeRequestListCards } from "./employee-request-list-cards";
import { EmployeeRequestListFilters } from "./employee-request-list-filters";
import { EmployeeRequestListSkeleton } from "./employee-request-list-skeleton";
import { EmployeeRequestListTable } from "./employee-request-list-table";
import { useEmployeeRequestListQueryState } from "../hooks/use-employee-request-list-query-state";
import { useEmployeeRequests } from "../hooks/use-employee-requests";

export function EmployeeRequestList() {
  const queryState = useEmployeeRequestListQueryState();
  const requestsQuery = useEmployeeRequests(queryState.params);

  if (requestsQuery.isLoading) {
    return <EmployeeRequestListSkeleton />;
  }

  if (requestsQuery.isError) {
    return (
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Employee workspace"
          title="My requests"
          description="Search, filter, and review requests that belong to you."
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
    return <EmployeeRequestListSkeleton />;
  }

  const hasResults = data.requests.length > 0;
  const hasAnyQuery = queryState.hasActiveFilters;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Employee workspace"
        title="My requests"
        description="Search, filter, sort, and track your request history."
        actions={
          <Link className={buttonVariants()} href="/employee/requests/new">
            New request
          </Link>
        }
      />

      <EmployeeRequestListFilters
        params={queryState.params}
        searchDraft={queryState.searchDraft}
        isSearching={requestsQuery.isFetching && !requestsQuery.isLoading}
        hasActiveFilters={queryState.hasActiveFilters}
        onSearchChange={queryState.setSearchDraft}
        onParamsChange={queryState.updateParams}
        onClearFilters={queryState.clearFilters}
      />

      {hasResults ? (
        <>
          <EmployeeRequestListTable requests={data.requests} />
          <EmployeeRequestListCards requests={data.requests} />
          <Pagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            onPageChange={(page) => queryState.updateParams({ page })}
          />
        </>
      ) : (
        <EmptyState
          title={hasAnyQuery ? "No matching requests" : "No requests yet"}
          description={
            hasAnyQuery
              ? "Clear filters or adjust your search to see more of your requests."
              : "Create your first request to start tracking approval progress."
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
            ) : (
              <Link className={buttonVariants()} href="/employee/requests/new">
                New request
              </Link>
            )
          }
        />
      )}
    </section>
  );
}
