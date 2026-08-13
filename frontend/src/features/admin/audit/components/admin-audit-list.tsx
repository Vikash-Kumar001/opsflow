"use client";

import { EmptyState, ErrorState, PageHeader, Pagination } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";

import { AdminAuditListCards } from "./admin-audit-list-cards";
import { AdminAuditListFilters } from "./admin-audit-list-filters";
import { AdminAuditListSkeleton } from "./admin-audit-list-skeleton";
import { AdminAuditListStats } from "./admin-audit-list-stats";
import { AdminAuditListTable } from "./admin-audit-list-table";
import { useAdminAuditListQueryState } from "../hooks/use-admin-audit-list-query-state";
import { useAdminAuditLogs } from "../hooks/use-admin-audit-logs";

export function AdminAuditList() {
  const queryState = useAdminAuditListQueryState();
  const auditLogsQuery = useAdminAuditLogs(queryState.params);

  if (auditLogsQuery.isLoading) {
    return <AdminAuditListSkeleton />;
  }

  if (auditLogsQuery.isError) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Admin workspace"
          title="Audit Logs"
          description="Inspect safe structured events across authentication, requests, comments, and user administration."
        />
        <ErrorState
          message={auditLogsQuery.error.message}
          onRetry={() => void auditLogsQuery.refetch()}
        />
      </section>
    );
  }

  const data = auditLogsQuery.data;

  if (!data) {
    return <AdminAuditListSkeleton />;
  }

  const hasResults = data.auditLogs.length > 0;
  const hasAnyQuery = queryState.hasActiveFilters;

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Audit Logs"
        description="Search, filter, and inspect append-only operational history without exposing sensitive payloads."
      />

      <AdminAuditListStats data={data} />

      <AdminAuditListFilters
        params={queryState.params}
        searchDraft={queryState.searchDraft}
        isSearching={auditLogsQuery.isFetching && !auditLogsQuery.isLoading}
        actorIdDraft={queryState.actorIdDraft}
        targetUserIdDraft={queryState.targetUserIdDraft}
        targetRequestIdDraft={queryState.targetRequestIdDraft}
        hasActiveFilters={queryState.hasActiveFilters}
        onSearchChange={queryState.setSearchDraft}
        onActorIdChange={queryState.setActorIdDraft}
        onTargetUserIdChange={queryState.setTargetUserIdDraft}
        onTargetRequestIdChange={queryState.setTargetRequestIdDraft}
        onApplyIdFilters={queryState.applyIdFilters}
        onParamsChange={queryState.updateParams}
        onClearFilters={queryState.clearFilters}
      />

      {hasResults ? (
        <>
          <AdminAuditListTable auditLogs={data.auditLogs} />
          <AdminAuditListCards auditLogs={data.auditLogs} />
          <Pagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            onPageChange={(page) => queryState.updateParams({ page })}
          />
        </>
      ) : (
        <EmptyState
          title={hasAnyQuery ? "No matching audit events" : "No audit events yet"}
          description={
            hasAnyQuery
              ? "Clear filters or adjust your search to inspect more audit activity."
              : "Audit events will appear here as users authenticate and perform sensitive actions."
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
