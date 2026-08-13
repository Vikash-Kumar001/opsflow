import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { createCommentAuditLog } from "../../../repositories/shared/audit-log.repository.js";
import { createCommentRecord } from "../../../repositories/shared/comments/comment.repository.js";
import { findVisibleRequestById } from "../../../repositories/shared/requests/request.repository.js";
import type { CommentRecord } from "../../../serializers/shared/comments/comment.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";
import type { CreateCommentBody } from "../../../validators/shared/requests/request.schemas.js";

export async function createRequestComment(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  requestId: string,
  input: CreateCommentBody,
): Promise<CommentRecord> {
  return prisma.$transaction(async (transaction) => {
    const request = await findVisibleRequestById(transaction, actor, requestId);

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    const comment = await createCommentRecord(transaction, {
      requestId: request.id,
      authorId: actor.id,
      content: input.content,
    });

    await createCommentAuditLog(transaction, {
      actorId: actor.id,
      commentId: comment.id,
      requestId: request.id,
      metadata: {
        requestNumber: request.requestNumber,
      },
    });

    return comment;
  });
}
