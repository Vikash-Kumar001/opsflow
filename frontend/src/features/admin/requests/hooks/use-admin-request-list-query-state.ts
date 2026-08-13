"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  type RequestCategory,
  type RequestPriority,
  type RequestStatus,
} from "@/features/shared/requests";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import type {
  AdminRequestListParams,
  AdminRequestSortBy,
  AdminRequestSortDirection,
} from "../types/admin-request.types";
import { ADMIN_REQUEST_SORT_OPTIONS } from "../types/admin-request.types";

const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = "updatedAt";
const DEFAULT_SORT_DIRECTION = "desc";
const SEARCH_DEBOUNCE_MS = 350;

export function useAdminRequestListQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParams = useMemo(
    () => parseAdminRequestListParams(searchParams),
    [searchParams],
  );
  const [searchDraft, setSearchDraft] = useState(urlParams.search ?? "");
  const debouncedSearch = useDebouncedValue(
    searchDraft.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const params = useMemo<AdminRequestListParams>(
    () => ({
      ...urlParams,
      search: debouncedSearch || undefined,
      page: (urlParams.search ?? "") === debouncedSearch ? urlParams.page : 1,
    }),
    [debouncedSearch, urlParams],
  );

  function updateParams(updates: Partial<AdminRequestListParams>) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const merged = { ...params, ...updates };

    nextParams.delete("search");
    setOptionalParam(nextParams, "status", merged.status);
    setOptionalParam(nextParams, "category", merged.category);
    setOptionalParam(nextParams, "priority", merged.priority);
    setOptionalParam(nextParams, "createdFrom", merged.createdFrom);
    setOptionalParam(nextParams, "createdTo", merged.createdTo);
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
    hasActiveFilters: hasActiveFilters(params),
  };
}

function parseAdminRequestListParams(
  searchParams: URLSearchParams,
): AdminRequestListParams {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: parsePositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT),
    search: parseNonEmptyString(searchParams.get("search")),
    status: parseEnum(searchParams.get("status"), REQUEST_STATUSES),
    category: parseEnum(searchParams.get("category"), REQUEST_CATEGORIES),
    priority: parseEnum(searchParams.get("priority"), REQUEST_PRIORITIES),
    createdFrom: parseDateInput(searchParams.get("createdFrom")),
    createdTo: parseDateInput(searchParams.get("createdTo")),
    sortBy:
      parseEnum(searchParams.get("sortBy"), ADMIN_REQUEST_SORT_OPTIONS) ??
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

function parseDateInput(value: string | null): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return `${value}T00:00:00.000Z`;
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
    searchParams.set(key, key.startsWith("created") ? value.slice(0, 10) : value);
    return;
  }

  searchParams.delete(key);
}

function setDefaultableParam(
  searchParams: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string,
) {
  if (value === defaultValue) {
    searchParams.delete(key);
    return;
  }

  searchParams.set(key, value);
}

function hasActiveFilters(params: AdminRequestListParams): boolean {
  return Boolean(
    params.search ||
      params.status ||
      params.category ||
      params.priority ||
      params.createdFrom ||
      params.createdTo ||
      params.page !== 1 ||
      params.limit !== DEFAULT_LIMIT ||
      params.sortBy !== DEFAULT_SORT_BY ||
      params.sortDirection !== DEFAULT_SORT_DIRECTION,
  );
}

export type AdminRequestFilterName = "status" | "category" | "priority";
export type AdminRequestFilterValue =
  | RequestStatus
  | RequestCategory
  | RequestPriority
  | undefined;
export type AdminRequestSortValue =
  `${AdminRequestSortBy}:${AdminRequestSortDirection}`;
