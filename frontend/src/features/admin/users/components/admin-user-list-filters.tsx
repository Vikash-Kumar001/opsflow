"use client";

import { FilterToolbar, SearchInput } from "@/components/shared";

import { AdminUserFilterSelect } from "./admin-user-filter-select";
import type { AdminUserListParams } from "../types/admin-user.types";
import {
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUSES,
} from "../types/admin-user.types";
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_STATUS_LABELS,
} from "../utils/admin-user-labels";

type AdminUserListFiltersProps = {
  params: AdminUserListParams;
  searchDraft: string;
  isSearching?: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onParamsChange: (params: Partial<AdminUserListParams>) => void;
  onClearFilters: () => void;
};

export function AdminUserListFilters({
  params,
  searchDraft,
  isSearching = false,
  hasActiveFilters,
  onSearchChange,
  onParamsChange,
  onClearFilters,
}: AdminUserListFiltersProps) {
  return (
    <FilterToolbar
      search={
        <SearchInput
          value={searchDraft}
          onChange={onSearchChange}
          label="Search users"
          placeholder="Search name or email"
          isLoading={isSearching}
        />
      }
      filters={
        <>
          <AdminUserFilterSelect
            label="Role"
            value={params.role ?? ""}
            options={ADMIN_USER_ROLES.map((role) => ({
              value: role,
              label: ADMIN_USER_ROLE_LABELS[role],
            }))}
            onChange={(role) => onParamsChange({ role, page: 1 })}
          />
          <AdminUserFilterSelect
            label="Status"
            value={params.status ?? ""}
            options={ADMIN_USER_STATUSES.map((status) => ({
              value: status,
              label: ADMIN_USER_STATUS_LABELS[status],
            }))}
            onChange={(status) => onParamsChange({ status, page: 1 })}
          />
        </>
      }
      onReset={hasActiveFilters ? onClearFilters : undefined}
      resetLabel="Clear filters"
    />
  );
}
