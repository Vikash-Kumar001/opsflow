"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
} from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/lib/api/api-error";

import { AdminUserListCards } from "./admin-user-list-cards";
import { AdminUserListFilters } from "./admin-user-list-filters";
import { AdminUserListSkeleton } from "./admin-user-list-skeleton";
import { AdminUserListStats } from "./admin-user-list-stats";
import { AdminUserListTable } from "./admin-user-list-table";
import { CreateAdminUserDialog } from "./create-admin-user-dialog";
import { useAdminUserListQueryState } from "../hooks/use-admin-user-list-query-state";
import {
  useChangeAdminUserRole,
  useChangeAdminUserStatus,
  useCreateAdminUser,
} from "../hooks/use-admin-user-mutations";
import { useAdminUsers } from "../hooks/use-admin-users";
import type {
  AdminUser,
  AdminUserRole,
  CreateAdminUserPayload,
} from "../types/admin-user.types";

export function AdminUserList() {
  const queryState = useAdminUserListQueryState();
  const usersQuery = useAdminUsers(queryState.params);
  const createUserMutation = useCreateAdminUser();
  const changeRoleMutation = useChangeAdminUserRole();
  const changeStatusMutation = useChangeAdminUserStatus();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  if (usersQuery.isLoading) {
    return <AdminUserListSkeleton />;
  }

  if (usersQuery.isError) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Admin workspace"
          title="Users"
          description="Create accounts, search users, and manage roles and activation state."
        />
        <ErrorState
          message={usersQuery.error.message}
          onRetry={() => void usersQuery.refetch()}
        />
      </section>
    );
  }

  const data = usersQuery.data;

  if (!data) {
    return <AdminUserListSkeleton />;
  }

  const hasResults = data.users.length > 0;
  const hasAnyQuery = queryState.hasActiveFilters;

  async function handleCreateUser(values: CreateAdminUserPayload) {
    await createUserMutation.mutateAsync(values);
    setPageError(null);
    setSuccessMessage(`Created ${values.email}.`);
  }

  async function handleChangeRole(user: AdminUser, role: AdminUserRole) {
    try {
      await changeRoleMutation.mutateAsync({ id: user.id, role });
      setPageError(null);
      setSuccessMessage(`Changed ${user.email} to ${role.toLowerCase()}.`);
    } catch (error) {
      setPageError(
        isApiError(error)
          ? error.message
          : "Unable to change this user's role. Please try again.",
      );
      throw error;
    }
  }

  async function handleChangeStatus(user: AdminUser) {
    try {
      await changeStatusMutation.mutateAsync({
        id: user.id,
        isActive: !user.isActive,
      });
      setPageError(null);
      setSuccessMessage(
        `${user.email} is now ${user.isActive ? "inactive" : "active"}.`,
      );
    } catch (error) {
      setPageError(
        isApiError(error)
          ? error.message
          : "Unable to change this user's status. Please try again.",
      );
      throw error;
    }
  }

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Users"
        description="Create accounts, search users, and manage roles and activation state."
        actions={
          <CreateAdminUserDialog
            isPending={createUserMutation.isPending}
            onSubmit={handleCreateUser}
            trigger={
              <Button type="button">
                <PlusIcon data-icon="inline-start" />
                Create user
              </Button>
            }
          />
        }
      />

      {pageError ? (
        <Alert variant="destructive">
          <AlertTitle>Admin safeguard blocked the action</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <AlertTitle>{successMessage}</AlertTitle>
          <AlertDescription>The user list will refresh automatically.</AlertDescription>
        </Alert>
      ) : null}

      <AdminUserListStats data={data} />

      <AdminUserListFilters
        params={queryState.params}
        searchDraft={queryState.searchDraft}
        isSearching={usersQuery.isFetching && !usersQuery.isLoading}
        hasActiveFilters={queryState.hasActiveFilters}
        onSearchChange={queryState.setSearchDraft}
        onParamsChange={queryState.updateParams}
        onClearFilters={queryState.clearFilters}
      />

      {hasResults ? (
        <>
          <AdminUserListTable
            users={data.users}
            isRolePending={changeRoleMutation.isPending}
            isStatusPending={changeStatusMutation.isPending}
            onChangeRole={handleChangeRole}
            onChangeStatus={handleChangeStatus}
          />
          <AdminUserListCards
            users={data.users}
            isRolePending={changeRoleMutation.isPending}
            isStatusPending={changeStatusMutation.isPending}
            onChangeRole={handleChangeRole}
            onChangeStatus={handleChangeStatus}
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
          title={hasAnyQuery ? "No matching users" : "No users yet"}
          description={
            hasAnyQuery
              ? "Clear filters or adjust your search to inspect more accounts."
              : "Create the first account to start managing OpsFlow access."
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
              <CreateAdminUserDialog
                isPending={createUserMutation.isPending}
                onSubmit={handleCreateUser}
                trigger={<Button type="button">Create user</Button>}
              />
            )
          }
        />
      )}
    </section>
  );
}
