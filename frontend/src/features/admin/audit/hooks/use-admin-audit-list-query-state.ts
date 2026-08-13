"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_ENTITY_TYPES,
  type AdminAuditAction,
  type AdminAuditEntityType,
  type AdminAuditListParams,
} from "../types/admin-audit.types";

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 350;

export function useAdminAuditListQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParams = useMemo(
    () => parseAdminAuditListParams(searchParams),
    [searchParams],
  );
  const [searchDraft, setSearchDraft] = useState(urlParams.search ?? "");
  const [actorIdDraft, setActorIdDraft] = useState(urlParams.actorId ?? "");
  const [targetUserIdDraft, setTargetUserIdDraft] = useState(
    urlParams.targetUserId ?? "",
  );
  const [targetRequestIdDraft, setTargetRequestIdDraft] = useState(
    urlParams.targetRequestId ?? "",
  );
  const debouncedSearch = useDebouncedValue(
    searchDraft.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const params = useMemo<AdminAuditListParams>(
    () => ({
      ...urlParams,
      search: debouncedSearch || undefined,
      page: (urlParams.search ?? "") === debouncedSearch ? urlParams.page : 1,
    }),
    [debouncedSearch, urlParams],
  );

  function updateParams(updates: Partial<AdminAuditListParams>) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const merged = { ...params, ...updates };

    nextParams.delete("search");
    setOptionalParam(nextParams, "action", merged.action);
    setOptionalParam(nextParams, "actorId", merged.actorId);
    setOptionalParam(nextParams, "entityType", merged.entityType);
    setOptionalParam(nextParams, "targetUserId", merged.targetUserId);
    setOptionalParam(nextParams, "targetRequestId", merged.targetRequestId);
    setOptionalParam(nextParams, "targetCommentId", merged.targetCommentId);
    setOptionalParam(nextParams, "createdFrom", merged.createdFrom);
    setOptionalParam(nextParams, "createdTo", merged.createdTo);
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

  function applyIdFilters() {
    updateParams({
      actorId: actorIdDraft.trim() || undefined,
      targetUserId: targetUserIdDraft.trim() || undefined,
      targetRequestId: targetRequestIdDraft.trim() || undefined,
      page: 1,
    });
  }

  function clearFilters() {
    setSearchDraft("");
    setActorIdDraft("");
    setTargetUserIdDraft("");
    setTargetRequestIdDraft("");
    router.replace(pathname);
  }

  return {
    params,
    searchDraft,
    setSearchDraft,
    actorIdDraft,
    setActorIdDraft,
    targetUserIdDraft,
    setTargetUserIdDraft,
    targetRequestIdDraft,
    setTargetRequestIdDraft,
    applyIdFilters,
    updateParams,
    clearFilters,
    hasActiveFilters: hasActiveFilters(params),
  };
}

function parseAdminAuditListParams(
  searchParams: URLSearchParams,
): AdminAuditListParams {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: parsePositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT),
    search: parseNonEmptyString(searchParams.get("search")),
    action: parseEnum(searchParams.get("action"), ADMIN_AUDIT_ACTIONS),
    actorId: parseNonEmptyString(searchParams.get("actorId")),
    entityType: parseEnum(
      searchParams.get("entityType"),
      ADMIN_AUDIT_ENTITY_TYPES,
    ),
    targetUserId: parseNonEmptyString(searchParams.get("targetUserId")),
    targetRequestId: parseNonEmptyString(searchParams.get("targetRequestId")),
    targetCommentId: parseNonEmptyString(searchParams.get("targetCommentId")),
    createdFrom: parseDateInput(searchParams.get("createdFrom"), "from"),
    createdTo: parseDateInput(searchParams.get("createdTo"), "to"),
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

function parseDateInput(
  value: string | null,
  boundary: "from" | "to",
): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return boundary === "from"
    ? `${value}T00:00:00.000Z`
    : `${value}T23:59:59.999Z`;
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

function hasActiveFilters(params: AdminAuditListParams): boolean {
  return Boolean(
    params.search ||
      params.action ||
      params.actorId ||
      params.entityType ||
      params.targetUserId ||
      params.targetRequestId ||
      params.targetCommentId ||
      params.createdFrom ||
      params.createdTo ||
      params.page !== 1 ||
      params.limit !== DEFAULT_LIMIT,
  );
}

export type AdminAuditFilterName = "action" | "entityType";
export type AdminAuditFilterValue =
  | AdminAuditAction
  | AdminAuditEntityType
  | undefined;
