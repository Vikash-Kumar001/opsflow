"use client";

import { FilterToolbar, SearchInput } from "@/components/shared";
import {
  REQUEST_CATEGORIES,
  REQUEST_CATEGORY_LABELS,
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LABELS,
  REQUEST_STATUS_LABELS,
  type RequestStatus,
} from "@/features/shared/requests";

import { ManagerRequestFilterSelect } from "./manager-request-filter-select";
import type {
  ManagerRequestListParams,
  ManagerRequestSortBy,
  ManagerRequestSortDirection,
} from "../types/manager-request-list.types";

type ManagerRequestListFiltersProps = {
  params: ManagerRequestListParams;
  searchDraft: string;
  isSearching?: boolean;
  statusOptions: readonly RequestStatus[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onParamsChange: (params: Partial<ManagerRequestListParams>) => void;
  onClearFilters: () => void;
};

export function ManagerRequestListFilters({
  params,
  searchDraft,
  isSearching = false,
  statusOptions,
  hasActiveFilters,
  onSearchChange,
  onParamsChange,
  onClearFilters,
}: ManagerRequestListFiltersProps) {
  const sortValue = `${params.sortBy}:${params.sortDirection}`;

  return (
    <FilterToolbar
      search={
        <SearchInput
          value={searchDraft}
          onChange={onSearchChange}
          label="Search team requests"
          placeholder="Search title, requester, or request number"
          isLoading={isSearching}
        />
      }
      filters={
        <>
          <ManagerRequestFilterSelect
            label="Status"
            value={params.status ?? ""}
            options={statusOptions.map((status) => ({
              value: status,
              label: REQUEST_STATUS_LABELS[status],
            }))}
            onChange={(status) => onParamsChange({ status, page: 1 })}
          />
          <ManagerRequestFilterSelect
            label="Category"
            value={params.category ?? ""}
            options={REQUEST_CATEGORIES.map((category) => ({
              value: category,
              label: REQUEST_CATEGORY_LABELS[category],
            }))}
            onChange={(category) => onParamsChange({ category, page: 1 })}
          />
          <ManagerRequestFilterSelect
            label="Priority"
            value={params.priority ?? ""}
            options={REQUEST_PRIORITIES.map((priority) => ({
              value: priority,
              label: REQUEST_PRIORITY_LABELS[priority],
            }))}
            onChange={(priority) => onParamsChange({ priority, page: 1 })}
          />
          <ManagerRequestFilterSelect
            label="Sort"
            value={sortValue}
            options={sortOptions}
            onChange={(value) => {
              if (!value) {
                onParamsChange({
                  sortBy: "updatedAt",
                  sortDirection: "desc",
                  page: 1,
                });
                return;
              }

              const [sortBy, sortDirection] = value.split(":") as [
                ManagerRequestSortBy,
                ManagerRequestSortDirection,
              ];

              onParamsChange({ sortBy, sortDirection, page: 1 });
            }}
          />
        </>
      }
      onReset={hasActiveFilters ? onClearFilters : undefined}
      resetLabel="Clear filters"
    />
  );
}

const sortOptions: Array<{
  value: `${ManagerRequestSortBy}:${ManagerRequestSortDirection}`;
  label: string;
}> = [
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "createdAt:desc", label: "Newest created" },
  { value: "createdAt:asc", label: "Oldest created" },
  { value: "submittedAt:desc", label: "Recently submitted" },
  { value: "priority:desc", label: "Priority high to low" },
  { value: "title:asc", label: "Title A-Z" },
];
