import {
  buildPaginationMeta,
  parsePagination,
} from "../../../utils/pagination.js";
import type { AdminAuditRepositoryClient } from "../../../repositories/admin/audit/admin-audit.repository.js";
import {
  listAuditLogs,
  type AuditLogRecord,
} from "../../../repositories/admin/audit/admin-audit.repository.js";
import type { ListAuditLogsQuery } from "../../../validators/admin/audit/admin-audit.schemas.js";

export type ListAuditLogsResult = {
  auditLogs: AuditLogRecord[];
  pagination: ReturnType<typeof buildPaginationMeta>;
};

export async function listAuditLogEvents(
  prisma: AdminAuditRepositoryClient,
  query: ListAuditLogsQuery,
): Promise<ListAuditLogsResult> {
  const paginationParams = parsePagination(query);
  const filters = {
    skip: paginationParams.skip,
    take: paginationParams.take,
  };

  for (const key of [
    "search",
    "action",
    "actorId",
    "entityType",
    "targetUserId",
    "targetRequestId",
    "targetCommentId",
    "createdFrom",
    "createdTo",
  ] as const) {
    const value = query[key];

    if (value !== undefined) {
      Object.assign(filters, { [key]: value });
    }
  }

  const result = await listAuditLogs(prisma, filters);

  return {
    auditLogs: result.auditLogs,
    pagination: buildPaginationMeta(paginationParams, result.total),
  };
}
