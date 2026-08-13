import { isEmployeeCancellableRequestStatus } from "../../../domain/request/request-status.js";
import { InvalidTransitionError } from "../../../errors/invalid-transition.error.js";
import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { createRequestAuditLog } from "../../../repositories/shared/audit-log.repository.js";
import {
  findOwnedRequestById,
  updateRequestRecord,
} from "../../../repositories/shared/requests/request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

export async function cancelOwnedRequest(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  id: string,
): Promise<RequestSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const request = await findOwnedRequestById(transaction, actor.id, id);

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status === "CANCELLED") {
      return request;
    }

    if (!isEmployeeCancellableRequestStatus(request.status)) {
      throw new InvalidTransitionError(
        `Cannot cancel request in ${request.status} status.`,
        {
          status: request.status,
          cancellableStatuses: ["DRAFT", "PENDING"],
        },
      );
    }

    const updatedRequest = await updateRequestRecord(transaction, id, {
      status: "CANCELLED",
    });

    await createRequestAuditLog(transaction, {
      actorId: actor.id,
      action: "REQUEST_CANCELLED",
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
