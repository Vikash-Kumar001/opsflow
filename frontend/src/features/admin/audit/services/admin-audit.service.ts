import { apiRequest } from "@/lib/api/api-client";

import type {
  AdminAuditListData,
  AdminAuditListParams,
  AdminAuditLogData,
} from "../types/admin-audit.types";

export function listAdminAuditLogs(
  params: AdminAuditListParams,
): Promise<AdminAuditListData> {
  return apiRequest<AdminAuditListData>(
    `/admin/audit-logs?${buildAdminAuditListSearchParams(params)}`,
  );
}

export function getAdminAuditLog(id: string): Promise<AdminAuditLogData> {
  return apiRequest<AdminAuditLogData>(`/admin/audit-logs/${id}`);
}

export function buildAdminAuditListSearchParams(
  params: AdminAuditListParams,
): string {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));

  const optionalParams = {
    search: params.search,
    action: params.action,
    actorId: params.actorId,
    entityType: params.entityType,
    targetUserId: params.targetUserId,
    targetRequestId: params.targetRequestId,
    targetCommentId: params.targetCommentId,
    createdFrom: params.createdFrom,
    createdTo: params.createdTo,
  };

  for (const [key, value] of Object.entries(optionalParams)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
