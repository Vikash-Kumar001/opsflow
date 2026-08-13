import type {
  AdminAuditAction,
  AdminAuditEntityType,
} from "../types/admin-audit.types";

export const AUDIT_ACTION_LABELS = {
  LOGIN_SUCCESS: "Login succeeded",
  LOGIN_FAILED: "Login failed",
  LOGOUT: "Logged out",
  PASSWORD_CHANGED: "Password changed",
  REQUEST_CREATED: "Request created",
  REQUEST_UPDATED: "Request updated",
  REQUEST_SUBMITTED: "Request submitted",
  REQUEST_REVIEW_STARTED: "Review started",
  REQUEST_CANCELLED: "Request cancelled",
  REQUEST_APPROVED: "Request approved",
  REQUEST_REJECTED: "Request rejected",
  REQUEST_DELETED: "Request archived",
  COMMENT_CREATED: "Comment added",
  USER_CREATED: "User created",
  USER_ACTIVATED: "User activated",
  USER_DEACTIVATED: "User deactivated",
  USER_ROLE_CHANGED: "Role changed",
} as const satisfies Record<AdminAuditAction, string>;

export const AUDIT_ENTITY_LABELS = {
  AUTH: "Authentication",
  USER: "User",
  REQUEST: "Request",
  COMMENT: "Comment",
} as const satisfies Record<AdminAuditEntityType, string>;

export const AUDIT_ACTION_TONE = {
  LOGIN_SUCCESS: "default",
  LOGIN_FAILED: "destructive",
  LOGOUT: "outline",
  PASSWORD_CHANGED: "secondary",
  REQUEST_CREATED: "default",
  REQUEST_UPDATED: "secondary",
  REQUEST_SUBMITTED: "default",
  REQUEST_REVIEW_STARTED: "secondary",
  REQUEST_CANCELLED: "outline",
  REQUEST_APPROVED: "default",
  REQUEST_REJECTED: "destructive",
  REQUEST_DELETED: "destructive",
  COMMENT_CREATED: "secondary",
  USER_CREATED: "default",
  USER_ACTIVATED: "default",
  USER_DEACTIVATED: "destructive",
  USER_ROLE_CHANGED: "secondary",
} as const satisfies Record<
  AdminAuditAction,
  "default" | "secondary" | "outline" | "destructive"
>;
