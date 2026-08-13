export const PERMISSIONS = {
  REQUEST_CREATE: "request:create",
  REQUEST_READ_OWN: "request:read:own",
  REQUEST_READ_TEAM: "request:read:team",
  REQUEST_READ_ALL: "request:read:all",
  REQUEST_UPDATE_OWN: "request:update:own",
  REQUEST_DELETE: "request:delete",
  REQUEST_SUBMIT: "request:submit",
  REQUEST_CANCEL: "request:cancel",
  REQUEST_APPROVE: "request:approve",
  REQUEST_REJECT: "request:reject",
  COMMENT_CREATE: "comment:create",
  USER_READ: "user:read",
  USER_MANAGE: "user:manage",
  USER_ROLE_UPDATE: "user:role:update",
  USER_STATUS_UPDATE: "user:status:update",
  AUDIT_READ: "audit:read",
  ANALYTICS_TEAM: "analytics:team",
  ANALYTICS_ORGANIZATION: "analytics:organization",
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
