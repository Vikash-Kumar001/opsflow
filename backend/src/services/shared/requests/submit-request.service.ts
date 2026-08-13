import { assertRequestStatusTransition } from "../../../domain/request/request-transitions.js";
import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { createRequestAuditLog } from "../../../repositories/shared/audit-log.repository.js";
import {
  findOwnedRequestById,
  updateRequestRecord,
} from "../../../repositories/shared/requests/request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

export async function submitOwnedRequest(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  id: string,
): Promise<RequestSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const request = await findOwnedRequestById(transaction, actor.id, id);

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status === "PENDING") {
      return request;
    }

    assertRequestStatusTransition(request.status, "PENDING");

    const updatedRequest = await updateRequestRecord(transaction, id, {
      status: "PENDING",
      submittedAt: new Date(),
    });

    await createRequestAuditLog(transaction, {
      actorId: actor.id,
      action: "REQUEST_SUBMITTED",
      requestId: updatedRequest.id,
      metadata: {
        requestNumber: updatedRequest.requestNumber,
        fromStatus: request.status,
        toStatus: updatedRequest.status,
      },
    });

    return updatedRequest;
  });
}
