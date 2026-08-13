import type { UserRole } from "../../domain/user/user.types.js";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "REQUEST_CREATED"
  | "REQUEST_UPDATED"
  | "REQUEST_SUBMITTED"
  | "REQUEST_REVIEW_STARTED"
  | "REQUEST_CANCELLED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "REQUEST_DELETED"
  | "COMMENT_CREATED"
  | "USER_CREATED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "USER_ROLE_CHANGED";

export type AuditEntityType = "AUTH" | "USER" | "REQUEST" | "COMMENT";

export const AUDIT_ACTIONS = [
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
] as const satisfies readonly AuditAction[];

export const AUDIT_ENTITY_TYPES = [
  "AUTH",
  "USER",
  "REQUEST",
  "COMMENT",
] as const satisfies readonly AuditEntityType[];

type AuditLogCreateInput = {
  actorId?: string | null | undefined;
  action: AuditAction;
  entityType: AuditEntityType;
  targetUserId?: string | null | undefined;
  targetRequestId?: string | null | undefined;
  targetCommentId?: string | null | undefined;
  metadata?: Record<string, unknown>;
  correlationId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

type AuditLogDelegate = {
  create(args: { data: AuditLogCreateInput }): Promise<unknown>;
};

export type AuditLogRepositoryClient = {
  auditLog: AuditLogDelegate;
};

type AuthAuditInput = {
  actorId?: string | null | undefined;
  action: AuditAction;
  email?: string | undefined;
  role?: UserRole | undefined;
  correlationId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

export async function createAuthAuditLog(
  prisma: AuditLogRepositoryClient,
  input: AuthAuditInput,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: "AUTH",
      targetUserId: input.actorId,
      metadata: {
        email: input.email,
        role: input.role,
        correlationId: input.correlationId,
      },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

type CommentAuditInput = {
  actorId: string;
  commentId: string;
  requestId: string;
  metadata?: Record<string, unknown>;
  correlationId?: string | undefined;
};

export async function createCommentAuditLog(
  prisma: AuditLogRepositoryClient,
  input: CommentAuditInput,
): Promise<void> {
  const data: AuditLogCreateInput = {
    actorId: input.actorId,
    action: "COMMENT_CREATED",
    entityType: "COMMENT",
    targetRequestId: input.requestId,
    targetCommentId: input.commentId,
  };

  if (input.metadata) {
    data.metadata = buildSafeAuditMetadata(input.metadata, input.correlationId);
  } else if (input.correlationId) {
    data.metadata = buildSafeAuditMetadata({}, input.correlationId);
  }

  await prisma.auditLog.create({
    data,
  });
}

type RequestAuditInput = {
  actorId: string;
  action: Extract<
    AuditAction,
    | "REQUEST_CREATED"
    | "REQUEST_UPDATED"
    | "REQUEST_SUBMITTED"
    | "REQUEST_REVIEW_STARTED"
    | "REQUEST_CANCELLED"
    | "REQUEST_APPROVED"
    | "REQUEST_REJECTED"
    | "REQUEST_DELETED"
  >;
  requestId: string;
  metadata?: Record<string, unknown>;
  correlationId?: string | undefined;
};

export async function createRequestAuditLog(
  prisma: AuditLogRepositoryClient,
  input: RequestAuditInput,
): Promise<void> {
  const data: AuditLogCreateInput = {
    actorId: input.actorId,
    action: input.action,
    entityType: "REQUEST",
    targetRequestId: input.requestId,
  };

  if (input.metadata) {
    data.metadata = buildSafeAuditMetadata(input.metadata, input.correlationId);
  } else if (input.correlationId) {
    data.metadata = buildSafeAuditMetadata({}, input.correlationId);
  }

  await prisma.auditLog.create({
    data,
  });
}

type UserAuditInput = {
  actorId: string;
  action: Extract<
    AuditAction,
    "USER_CREATED" | "USER_ACTIVATED" | "USER_DEACTIVATED" | "USER_ROLE_CHANGED"
  >;
  userId: string;
  metadata?: Record<string, unknown>;
  correlationId?: string | undefined;
};

export async function createUserAuditLog(
  prisma: AuditLogRepositoryClient,
  input: UserAuditInput,
): Promise<void> {
  const data: AuditLogCreateInput = {
    actorId: input.actorId,
    action: input.action,
    entityType: "USER",
    targetUserId: input.userId,
  };

  if (input.metadata) {
    data.metadata = buildSafeAuditMetadata(input.metadata, input.correlationId);
  } else if (input.correlationId) {
    data.metadata = buildSafeAuditMetadata({}, input.correlationId);
  }

  await prisma.auditLog.create({
    data,
  });
}

const SENSITIVE_METADATA_KEYS = [
  "authorization",
  "auth",
  "cookie",
  "jwt",
  "password",
  "passwordHash",
  "secret",
  "set-cookie",
  "token",
] as const;

function buildSafeAuditMetadata(
  metadata: Record<string, unknown>,
  correlationId?: string,
): Record<string, unknown> {
  const safeMetadata = sanitizeAuditMetadata(metadata);

  if (correlationId) {
    safeMetadata.correlationId = correlationId;
  }

  return safeMetadata;
}

export function sanitizeAuditMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !isSensitiveMetadataKey(key))
      .map(([key, value]) => [key, sanitizeAuditMetadataValue(value)]),
  );
}

function sanitizeAuditMetadataValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeAuditMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeAuditMetadata(value as Record<string, unknown>);
  }

  return value;
}

function isSensitiveMetadataKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return SENSITIVE_METADATA_KEYS.some((sensitiveKey) =>
    normalizedKey.includes(sensitiveKey.toLowerCase()),
  );
}
