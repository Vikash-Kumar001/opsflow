import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { findVisibleRequestById } from "../../../repositories/shared/requests/request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

export async function getRequestById(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  id: string,
): Promise<RequestSummaryRecord> {
  const request = await findVisibleRequestById(prisma, actor, id);

  if (!request) {
    throw new NotFoundError("Request not found");
  }

  return request;
}
