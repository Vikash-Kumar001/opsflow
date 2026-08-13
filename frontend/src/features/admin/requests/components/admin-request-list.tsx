"use client";

import { useState } from "react";

import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
} from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import type { RequestSummary } from "@/features/shared/requests";
import { isApiError } from "@/lib/api/api-error";

import { AdminRequestListCards } from "./admin-request-list-cards";
import { AdminRequestListFilters } from "./admin-request-list-filters";
import { AdminRequestListSkeleton } from "./admin-request-list-skeleton";
import { AdminRequestListStats } from "./admin-request-list-stats";
import { AdminRequestListTable } from "./admin-request-list-table";
import { useAdminRequestListQueryState } from "../hooks/use-admin-request-list-query-state";
import { useAdminRequests } from "../hooks/use-admin-requests";
import { useDeleteAdminRequest } from "../hooks/use-delete-admin-request";

export function AdminRequestList() {
  const queryState = useAdminRequestListQueryState();
  const requestsQuery = useAdminRequests(queryState.params);
  const deleteRequestMutation = useDeleteAdminRequest();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  if (requestsQuery.isLoading) {
    return <AdminRequestListSkeleton />;
  }

  if (requestsQuery.isError) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Admin workspace"
          title="Requests"
          description="Search and inspect organization-wide request activity."
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
    return <AdminRequestListSkeleton />;
  }

  const hasResults = data.requests.length > 0;
  const hasAnyQuery = queryState.hasActiveFilters;

  async function handleDelete(request: RequestSummary) {
    try {
      await deleteRequestMutation.mutateAsync(request.id);
      setPageError(null);
      setSuccessMessage(`${request.requestNumber} was archived.`);
    } catch (error) {
      setPageError(
        isApiError(error)
          ? error.message
          : "Unable to archive this request. Please try again.",
      );
      throw error;
    }
  }

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Requests"
        description="Search, filter, sort, and inspect request activity across the organization."
      />

      {pageError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to archive request</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <AlertTitle>{successMessage}</AlertTitle>
          <AlertDescription>Normal request lists hide archived requests.</AlertDescription>
        </Alert>
      ) : null}

      <AdminRequestListStats data={data} />

      <AdminRequestListFilters
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
          <AdminRequestListTable
            requests={data.requests}
            isDeletePending={deleteRequestMutation.isPending}
            onDelete={handleDelete}
          />
          <AdminRequestListCards
            requests={data.requests}
            isDeletePending={deleteRequestMutation.isPending}
            onDelete={handleDelete}
          />
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
              ? "Clear filters or adjust your search to inspect more organization requests."
              : "Organization requests will appear here once employees create them."
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
            ) : null
          }
        />
      )}
    </section>
  );
}
