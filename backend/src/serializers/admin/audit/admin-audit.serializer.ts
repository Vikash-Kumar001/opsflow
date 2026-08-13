import {
  serializeUserSummary,
  type SerializedUserSummary,
} from "../../../serializers/shared/user-summary.serializer.js";
import { serializePagination } from "../../../serializers/shared/pagination.serializer.js";
import type { PaginationMeta } from "../../../utils/pagination.js";
import type {
  AuditLogRecord,
  AuditLogTargetCommentRecord,
  AuditLogTargetRequestRecord,
} from "../../../repositories/admin/audit/admin-audit.repository.js";
import type {
  AuditAction,
  AuditEntityType,
} from "../../../repositories/shared/audit-log.repository.js";
import { sanitizeAuditMetadata } from "../../../repositories/shared/audit-log.repository.js";

export type SerializedAuditLog = {
  id: string;
  actorId: string | null;
  actor: SerializedUserSummary | null;
  action: AuditAction;
  entityType: AuditEntityType;
  targetUserId: string | null;
  targetUser: SerializedUserSummary | null;
  targetRequestId: string | null;
  targetRequest: AuditLogTargetRequestRecord | null;
  targetCommentId: string | null;
  targetComment: AuditLogTargetCommentRecord | null;
  metadata: Record<string, unknown> | null;
  correlationId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export function serializeAuditLog(
  auditLog: AuditLogRecord,
): SerializedAuditLog {
  return {
    id: auditLog.id,
    actorId: auditLog.actorId,
    actor: auditLog.actor ? serializeUserSummary(auditLog.actor) : null,
    action: auditLog.action,
    entityType: auditLog.entityType,
    targetUserId: auditLog.targetUserId,
    targetUser: auditLog.targetUser
      ? serializeUserSummary(auditLog.targetUser)
      : null,
    targetRequestId: auditLog.targetRequestId,
    targetRequest: auditLog.targetRequest,
    targetCommentId: auditLog.targetCommentId,
    targetComment: auditLog.targetComment,
    metadata: auditLog.metadata
      ? sanitizeAuditMetadata(auditLog.metadata)
      : null,
    correlationId: getCorrelationId(auditLog.metadata),
    ipAddress: auditLog.ipAddress,
    userAgent: auditLog.userAgent,
    createdAt: auditLog.createdAt.toISOString(),
  };
}

export function serializeAuditLogResponse(auditLog: AuditLogRecord): {
  auditLog: SerializedAuditLog;
} {
  return {
    auditLog: serializeAuditLog(auditLog),
  };
}

export function serializeAuditLogListResponse(
  auditLogs: AuditLogRecord[],
  pagination: PaginationMeta,
): {
  auditLogs: SerializedAuditLog[];
  pagination: PaginationMeta;
} {
  return {
    auditLogs: auditLogs.map(serializeAuditLog),
    pagination: serializePagination(pagination),
  };
}

function getCorrelationId(
  metadata: Record<string, unknown> | null,
): string | null {
  return typeof metadata?.correlationId === "string"
    ? metadata.correlationId
    : null;
}
