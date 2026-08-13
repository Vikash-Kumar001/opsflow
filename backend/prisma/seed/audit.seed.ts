import { AuditAction, AuditEntityType } from "../../generated/prisma/enums.js";
import { auditIds } from "./demo-ids.js";
import type {
  SeedComment,
  SeedPrismaClient,
  SeedRequest,
  SeedUsers,
} from "./types.js";

export async function seedAuditLogs(
  prisma: SeedPrismaClient,
  users: SeedUsers,
  requests: SeedRequest[],
  comments: SeedComment[],
) {
  const auditTemplates = [
    ...Object.values(users).map((user) => ({
      action: AuditAction.USER_CREATED,
      entityType: AuditEntityType.USER,
      actorId: users.admin.id,
      targetUserId: user.id,
      metadata: { source: "demo-seed" },
    })),
    ...requests.slice(0, 14).map((request) => ({
      action: AuditAction.REQUEST_CREATED,
      entityType: AuditEntityType.REQUEST,
      actorId: request.createdById,
      targetRequestId: request.id,
      metadata: { requestNumber: request.requestNumber, source: "demo-seed" },
    })),
    ...requests.slice(0, 6).map((request) => ({
      action: AuditAction.REQUEST_SUBMITTED,
      entityType: AuditEntityType.REQUEST,
      actorId: request.createdById,
      targetRequestId: request.id,
      metadata: { requestNumber: request.requestNumber, source: "demo-seed" },
    })),
    ...requests.slice(0, 3).map((request) => ({
      action: AuditAction.REQUEST_APPROVED,
      entityType: AuditEntityType.REQUEST,
      actorId: users.manager.id,
      targetRequestId: request.id,
      metadata: { requestNumber: request.requestNumber, source: "demo-seed" },
    })),
    ...comments.slice(0, 2).map((comment) => ({
      action: AuditAction.COMMENT_CREATED,
      entityType: AuditEntityType.COMMENT,
      actorId: comment.authorId,
      targetCommentId: comment.id,
      targetRequestId: comment.requestId,
      metadata: { source: "demo-seed" },
    })),
  ].slice(0, auditIds.length);

  return Promise.all(
    auditTemplates.map((audit, index) =>
      prisma.auditLog.upsert({
        where: { id: auditIds[index] },
        create: {
          id: auditIds[index],
          action: audit.action,
          entityType: audit.entityType,
          actorId: audit.actorId,
          targetUserId: "targetUserId" in audit ? audit.targetUserId : null,
          targetRequestId:
            "targetRequestId" in audit ? audit.targetRequestId : null,
          targetCommentId:
            "targetCommentId" in audit ? audit.targetCommentId : null,
          metadata: audit.metadata,
          ipAddress: "127.0.0.1",
          userAgent: "OpsFlow demo seed",
        },
        update: {
          action: audit.action,
          entityType: audit.entityType,
          actorId: audit.actorId,
          targetUserId: "targetUserId" in audit ? audit.targetUserId : null,
          targetRequestId:
            "targetRequestId" in audit ? audit.targetRequestId : null,
          targetCommentId:
            "targetCommentId" in audit ? audit.targetCommentId : null,
          metadata: audit.metadata,
          ipAddress: "127.0.0.1",
          userAgent: "OpsFlow demo seed",
        },
      }),
    ),
  );
}
