"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "@/features/shared/requests";
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
} from "@/features/shared/requests";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import type {
  ManagerRequestListParams,
  ManagerRequestSortBy,
  ManagerRequestSortDirection,
} from "../types/manager-request-list.types";
import { MANAGER_REQUEST_SORT_OPTIONS } from "../types/manager-request-list.types";

const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = "updatedAt";
const DEFAULT_SORT_DIRECTION = "desc";
const SEARCH_DEBOUNCE_MS = 350;

type ManagerRequestListQueryStateOptions = {
  defaultStatus?: RequestStatus;
  allowedStatuses?: readonly RequestStatus[];
};

export function useManagerRequestListQueryState(
  options: ManagerRequestListQueryStateOptions = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const allowedStatuses = options.allowedStatuses ?? REQUEST_STATUSES;
  const urlParams = useMemo(
    () =>
      parseRequestListParams(searchParams, {
        defaultStatus: options.defaultStatus,
        allowedStatuses,
      }),
    [allowedStatuses, options.defaultStatus, searchParams],
  );
  const [searchDraft, setSearchDraft] = useState(urlParams.search ?? "");
  const debouncedSearch = useDebouncedValue(
    searchDraft.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const params = useMemo<ManagerRequestListParams>(
    () => ({
      ...urlParams,
      search: debouncedSearch || undefined,
      page: (urlParams.search ?? "") === debouncedSearch ? urlParams.page : 1,
    }),
    [debouncedSearch, urlParams],
  );

  function updateParams(updates: Partial<ManagerRequestListParams>) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const merged = { ...params, ...updates };

    nextParams.delete("search");
    setDefaultableParam(
      nextParams,
      "status",
      merged.status,
      options.defaultStatus,
    );
    setOptionalParam(nextParams, "category", merged.category);
    setOptionalParam(nextParams, "priority", merged.priority);
    setDefaultableParam(nextParams, "page", String(merged.page), "1");
    setDefaultableParam(
      nextParams,
      "limit",
      String(merged.limit),
      String(DEFAULT_LIMIT),
    );
    setDefaultableParam(nextParams, "sortBy", merged.sortBy, DEFAULT_SORT_BY);
    setDefaultableParam(
      nextParams,
      "sortDirection",
      merged.sortDirection,
      DEFAULT_SORT_DIRECTION,
    );

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function clearFilters() {
    setSearchDraft("");
    router.replace(pathname);
  }

  return {
    params,
    searchDraft,
    setSearchDraft,
    updateParams,
    clearFilters,
    hasActiveFilters: hasActiveFilters(params, options.defaultStatus),
  };
}

function parseRequestListParams(
  searchParams: URLSearchParams,
  options: Required<
    Pick<ManagerRequestListQueryStateOptions, "allowedStatuses">
  > &
    Pick<ManagerRequestListQueryStateOptions, "defaultStatus">,
): ManagerRequestListParams {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: parsePositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT),
    search: parseNonEmptyString(searchParams.get("search")),
    status:
      parseEnum(searchParams.get("status"), options.allowedStatuses) ??
      options.defaultStatus,
    category: parseEnum(searchParams.get("category"), REQUEST_CATEGORIES),
    priority: parseEnum(searchParams.get("priority"), REQUEST_PRIORITIES),
    sortBy:
      parseEnum(searchParams.get("sortBy"), MANAGER_REQUEST_SORT_OPTIONS) ??
      DEFAULT_SORT_BY,
    sortDirection:
      parseEnum(
        searchParams.get("sortDirection"),
        ["asc", "desc"] as const,
      ) ?? DEFAULT_SORT_DIRECTION,
  };
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonEmptyString(value: string | null): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function parseEnum<TValue extends string>(
  value: string | null,
  allowedValues: readonly TValue[],
): TValue | undefined {
  return allowedValues.includes(value as TValue) ? (value as TValue) : undefined;
}

function setOptionalParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) {
    searchParams.set(key, value);
    return;
  }

  searchParams.delete(key);
}

function setDefaultableParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined,
  defaultValue: string | undefined,
) {
  if (!value || value === defaultValue) {
    searchParams.delete(key);
    return;
  }

  searchParams.set(key, value);
}

function hasActiveFilters(
  params: ManagerRequestListParams,
  defaultStatus: RequestStatus | undefined,
): boolean {
  return Boolean(
    params.search ||
      params.status !== defaultStatus ||
      params.category ||
      params.priority ||
      params.page !== 1 ||
      params.limit !== DEFAULT_LIMIT ||
      params.sortBy !== DEFAULT_SORT_BY ||
      params.sortDirection !== DEFAULT_SORT_DIRECTION,
  );
}

export type ManagerRequestFilterName = "status" | "category" | "priority";
export type ManagerRequestFilterValue =
  | RequestStatus
  | RequestCategory
  | RequestPriority
  | undefined;
export type ManagerRequestSortValue =
  `${ManagerRequestSortBy}:${ManagerRequestSortDirection}`;
