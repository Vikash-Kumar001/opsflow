import { isEmployeeEditableRequestStatus } from "../../../domain/request/request-status.js";
import { InvalidTransitionError } from "../../../errors/invalid-transition.error.js";
import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { createRequestAuditLog } from "../../../repositories/shared/audit-log.repository.js";
import {
  findOwnedRequestById,
  type RequestUpdateInput,
  updateRequestRecord,
} from "../../../repositories/shared/requests/request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";
import type { UpdateRequestBody } from "../../../validators/shared/requests/request.schemas.js";

export async function updateOwnedRequest(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  id: string,
  input: UpdateRequestBody,
): Promise<RequestSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const request = await findOwnedRequestById(transaction, actor.id, id);

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (!isEmployeeEditableRequestStatus(request.status)) {
      throw new InvalidTransitionError(
        `Cannot edit request in ${request.status} status.`,
        {
          status: request.status,
          editableStatuses: ["DRAFT", "PENDING"],
        },
      );
    }

    const updateInput = buildUpdateInput(input);
    const updatedRequest = await updateRequestRecord(
      transaction,
      id,
      updateInput,
    );

    await createRequestAuditLog(transaction, {
      actorId: actor.id,
      action: "REQUEST_UPDATED",
      requestId: updatedRequest.id,
      metadata: {
        requestNumber: updatedRequest.requestNumber,
        changedFields: Object.keys(updateInput),
      },
    });

    return updatedRequest;
  });
}

function buildUpdateInput(input: UpdateRequestBody): RequestUpdateInput {
  const updateInput: RequestUpdateInput = {};

  if (input.title !== undefined) {
    updateInput.title = input.title;
  }

  if (input.description !== undefined) {
    updateInput.description = input.description;
  }

  if (input.category !== undefined) {
    updateInput.category = input.category;
  }

  if (input.priority !== undefined) {
    updateInput.priority = input.priority;
  }

  if (input.metadata !== undefined) {
    updateInput.metadata = input.metadata;
  }

  return updateInput;
}
