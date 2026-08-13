import type { AdminAuditListParams } from "../types/admin-audit.types";

export const adminAuditQueryKeys = {
  all: ["admin", "audit-logs"] as const,
  lists: () => [...adminAuditQueryKeys.all, "list"] as const,
  list: (params: AdminAuditListParams) =>
    [...adminAuditQueryKeys.lists(), params] as const,
  details: () => [...adminAuditQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...adminAuditQueryKeys.details(), id] as const,
};
