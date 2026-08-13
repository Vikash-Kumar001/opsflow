"use client";

import { FilterToolbar, SearchInput } from "@/components/shared";
import { Label } from "@/components/ui/label";
import {
  REQUEST_CATEGORIES,
  REQUEST_CATEGORY_LABELS,
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LABELS,
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
} from "@/features/shared/requests";

import { AdminRequestFilterSelect } from "./admin-request-filter-select";
import type {
  AdminRequestListParams,
  AdminRequestSortBy,
  AdminRequestSortDirection,
} from "../types/admin-request.types";

type AdminRequestListFiltersProps = {
  params: AdminRequestListParams;
  searchDraft: string;
  isSearching?: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onParamsChange: (params: Partial<AdminRequestListParams>) => void;
  onClearFilters: () => void;
};

export function AdminRequestListFilters({
  params,
  searchDraft,
  isSearching = false,
  hasActiveFilters,
  onSearchChange,
  onParamsChange,
  onClearFilters,
}: AdminRequestListFiltersProps) {
  const sortValue = `${params.sortBy}:${params.sortDirection}`;

  return (
    <FilterToolbar
      search={
        <SearchInput
          value={searchDraft}
          onChange={onSearchChange}
          label="Search organization requests"
          placeholder="Search title, description, or request number"
          isLoading={isSearching}
        />
      }
      filters={
        <>
          <AdminRequestFilterSelect
            label="Status"
            value={params.status ?? ""}
            options={REQUEST_STATUSES.map((status) => ({
              value: status,
              label: REQUEST_STATUS_LABELS[status],
            }))}
            onChange={(status) => onParamsChange({ status, page: 1 })}
          />
          <AdminRequestFilterSelect
            label="Category"
            value={params.category ?? ""}
            options={REQUEST_CATEGORIES.map((category) => ({
              value: category,
              label: REQUEST_CATEGORY_LABELS[category],
            }))}
            onChange={(category) => onParamsChange({ category, page: 1 })}
          />
          <AdminRequestFilterSelect
            label="Priority"
            value={params.priority ?? ""}
            options={REQUEST_PRIORITIES.map((priority) => ({
              value: priority,
              label: REQUEST_PRIORITY_LABELS[priority],
            }))}
            onChange={(priority) => onParamsChange({ priority, page: 1 })}
          />
          <DateFilter
            label="Created from"
            value={params.createdFrom?.slice(0, 10) ?? ""}
            onChange={(createdFrom) => onParamsChange({ createdFrom, page: 1 })}
          />
          <DateFilter
            label="Created to"
            value={params.createdTo?.slice(0, 10) ?? ""}
            onChange={(createdTo) => onParamsChange({ createdTo, page: 1 })}
          />
          <AdminRequestFilterSelect
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
                AdminRequestSortBy,
                AdminRequestSortDirection,
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

type DateFilterProps = {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
};

function DateFilter({ label, value, onChange }: DateFilterProps) {
  return (
    <Label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        className="h-8 min-w-36 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
              ? `${event.target.value}T00:00:00.000Z`
              : undefined,
          )
        }
      />
    </Label>
  );
}

const sortOptions: Array<{
  value: `${AdminRequestSortBy}:${AdminRequestSortDirection}`;
  label: string;
}> = [
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "createdAt:desc", label: "Newest created" },
  { value: "createdAt:asc", label: "Oldest created" },
  { value: "submittedAt:desc", label: "Recently submitted" },
  { value: "priority:desc", label: "Priority high to low" },
  { value: "title:asc", label: "Title A-Z" },
];
