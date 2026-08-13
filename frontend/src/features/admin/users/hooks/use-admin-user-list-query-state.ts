"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import type {
  AdminUserListParams,
  AdminUserRole,
  AdminUserStatus,
} from "../types/admin-user.types";
import {
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUSES,
} from "../types/admin-user.types";

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 350;

export function useAdminUserListQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParams = useMemo(
    () => parseAdminUserListParams(searchParams),
    [searchParams],
  );
  const [searchDraft, setSearchDraft] = useState(urlParams.search ?? "");
  const debouncedSearch = useDebouncedValue(
    searchDraft.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const params = useMemo<AdminUserListParams>(
    () => ({
      ...urlParams,
      search: debouncedSearch || undefined,
      page: (urlParams.search ?? "") === debouncedSearch ? urlParams.page : 1,
    }),
    [debouncedSearch, urlParams],
  );

  function updateParams(updates: Partial<AdminUserListParams>) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const merged = { ...params, ...updates };

    nextParams.delete("search");
    setOptionalParam(nextParams, "role", merged.role);
    setOptionalParam(nextParams, "status", merged.status);
    setDefaultableParam(nextParams, "page", String(merged.page), "1");
    setDefaultableParam(
      nextParams,
      "limit",
      String(merged.limit),
      String(DEFAULT_LIMIT),
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

function parseAdminUserListParams(
  searchParams: URLSearchParams,
): AdminUserListParams {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: parsePositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT),
    search: parseNonEmptyString(searchParams.get("search")),
    role: parseEnum(searchParams.get("role"), ADMIN_USER_ROLES),
    status: parseEnum(searchParams.get("status"), ADMIN_USER_STATUSES),
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
  value: string,
  defaultValue: string,
) {
  if (value === defaultValue) {
    searchParams.delete(key);
    return;
  }

  searchParams.set(key, value);
}

function hasActiveFilters(params: AdminUserListParams): boolean {
  return Boolean(
    params.search ||
      params.role ||
      params.status ||
      params.page !== 1 ||
      params.limit !== DEFAULT_LIMIT,
  );
}

export type AdminUserFilterName = "role" | "status";
export type AdminUserFilterValue =
  | AdminUserRole
  | AdminUserStatus
  | undefined;
