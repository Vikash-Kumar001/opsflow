import type { RequestUserSummary } from "@/features/shared/requests";

export const ADMIN_AUDIT_ACTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "PASSWORD_CHANGED",
  "REQUEST_CREATED",
  "REQUEST_UPDATED",
  "REQUEST_SUBMITTED",
  "REQUEST_REVIEW_STARTED",
  "REQUEST_CANCELLED",
  "REQUEST_APPROVED",
  "REQUEST_REJECTED",
  "REQUEST_DELETED",
  "COMMENT_CREATED",
  "USER_CREATED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "USER_ROLE_CHANGED",
] as const;

export const ADMIN_AUDIT_ENTITY_TYPES = [
  "AUTH",
  "USER",
  "REQUEST",
  "COMMENT",
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditEntityType = (typeof ADMIN_AUDIT_ENTITY_TYPES)[number];

export type AdminAuditTargetRequest = {
  id: string;
  requestNumber: string;
  title: string;
};

export type AdminAuditTargetComment = {
  id: string;
  content: string;
};

export type AdminAuditLog = {
  id: string;
  actorId: string | null;
  actor: RequestUserSummary | null;
  action: AdminAuditAction;
  entityType: AdminAuditEntityType;
  targetUserId: string | null;
  targetUser: RequestUserSummary | null;
  targetRequestId: string | null;
  targetRequest: AdminAuditTargetRequest | null;
  targetCommentId: string | null;
  targetComment: AdminAuditTargetComment | null;
  metadata: Record<string, unknown> | null;
  correlationId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AdminAuditListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminAuditListParams = {
  page: number;
  limit: number;
  search?: string;
  action?: AdminAuditAction;
  actorId?: string;
  entityType?: AdminAuditEntityType;
  targetUserId?: string;
  targetRequestId?: string;
  targetCommentId?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type AdminAuditListData = {
  auditLogs: AdminAuditLog[];
  pagination: AdminAuditListPagination;
};

export type AdminAuditLogData = {
  auditLog: AdminAuditLog;
};
