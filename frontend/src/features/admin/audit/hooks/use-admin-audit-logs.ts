"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getAdminAuditLog,
  listAdminAuditLogs,
} from "../services/admin-audit.service";
import type { AdminAuditListParams } from "../types/admin-audit.types";
import { adminAuditQueryKeys } from "./admin-audit-query-keys";

export function useAdminAuditLogs(params: AdminAuditListParams) {
  return useQuery({
    queryKey: adminAuditQueryKeys.list(params),
    queryFn: () => listAdminAuditLogs(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAuditLog(id: string) {
  return useQuery({
    queryKey: adminAuditQueryKeys.detail(id),
    queryFn: () => getAdminAuditLog(id),
    enabled: Boolean(id),
  });
}
