"use client";

import {
  FilterToolbar,
  SearchInput,
} from "@/components/shared";
import {
  REQUEST_CATEGORIES,
  REQUEST_CATEGORY_LABELS,
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LABELS,
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
} from "@/features/shared/requests";

import { RequestFilterSelect } from "./request-filter-select";
import type {
  EmployeeRequestListParams,
  RequestSortBy,
  SortDirection,
} from "../types/employee-request-list.types";

type EmployeeRequestListFiltersProps = {
  params: EmployeeRequestListParams;
  searchDraft: string;
  isSearching?: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onParamsChange: (params: Partial<EmployeeRequestListParams>) => void;
  onClearFilters: () => void;
};

export function EmployeeRequestListFilters({
  params,
  searchDraft,
  isSearching = false,
  hasActiveFilters,
  onSearchChange,
  onParamsChange,
  onClearFilters,
}: EmployeeRequestListFiltersProps) {
  const sortValue = `${params.sortBy}:${params.sortDirection}`;

  return (
    <FilterToolbar
      search={
        <SearchInput
          value={searchDraft}
          onChange={onSearchChange}
          label="Search my requests"
          placeholder="Search title, description, or request number"
          isLoading={isSearching}
        />
      }
      filters={
        <>
          <RequestFilterSelect
            label="Status"
            value={params.status ?? ""}
            options={REQUEST_STATUSES.map((status) => ({
              value: status,
              label: REQUEST_STATUS_LABELS[status],
            }))}
            onChange={(status) => onParamsChange({ status, page: 1 })}
          />
          <RequestFilterSelect
            label="Category"
            value={params.category ?? ""}
            options={REQUEST_CATEGORIES.map((category) => ({
              value: category,
              label: REQUEST_CATEGORY_LABELS[category],
            }))}
            onChange={(category) => onParamsChange({ category, page: 1 })}
          />
          <RequestFilterSelect
            label="Priority"
            value={params.priority ?? ""}
            options={REQUEST_PRIORITIES.map((priority) => ({
              value: priority,
              label: REQUEST_PRIORITY_LABELS[priority],
            }))}
            onChange={(priority) => onParamsChange({ priority, page: 1 })}
          />
          <RequestFilterSelect
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
                RequestSortBy,
                SortDirection,
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
  value: `${RequestSortBy}:${SortDirection}`;
  label: string;
}> = [
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "createdAt:desc", label: "Newest created" },
  { value: "createdAt:asc", label: "Oldest created" },
  { value: "submittedAt:desc", label: "Recently submitted" },
  { value: "priority:desc", label: "Priority high to low" },
  { value: "title:asc", label: "Title A-Z" },
];
