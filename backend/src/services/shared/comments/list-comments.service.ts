import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { listCommentsForRequest } from "../../../repositories/shared/comments/comment.repository.js";
import { findVisibleRequestById } from "../../../repositories/shared/requests/request.repository.js";
import type { CommentRecord } from "../../../serializers/shared/comments/comment.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

export async function listRequestComments(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  requestId: string,
): Promise<CommentRecord[]> {
  const request = await findVisibleRequestById(prisma, actor, requestId);

  if (!request) {
    throw new NotFoundError("Request not found");
  }

  return listCommentsForRequest(prisma, request.id);
}
