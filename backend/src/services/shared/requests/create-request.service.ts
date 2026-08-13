import { DEFAULT_REQUEST_PRIORITY } from "../../../domain/request/request.constants.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import { createRequestAuditLog } from "../../../repositories/shared/audit-log.repository.js";
import { generateNextRequestNumber } from "../../../repositories/shared/request-number.repository.js";
import { createRequestRecord } from "../../../repositories/shared/requests/request.repository.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";
import type { CreateRequestBody } from "../../../validators/shared/requests/request.schemas.js";

export async function createRequest(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  input: CreateRequestBody,
): Promise<RequestSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const requestNumber = await generateNextRequestNumber(transaction);
    const shouldSubmit = input.submit === true;
    const request = await createRequestRecord(transaction, {
      requestNumber,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority ?? DEFAULT_REQUEST_PRIORITY,
      status: shouldSubmit ? "PENDING" : "DRAFT",
      createdById: actor.id,
      metadata: input.metadata,
      submittedAt: shouldSubmit ? new Date() : undefined,
    });

    await createRequestAuditLog(transaction, {
      actorId: actor.id,
      action: "REQUEST_CREATED",
      requestId: request.id,
      metadata: {
        requestNumber: request.requestNumber,
        submitted: shouldSubmit,
      },
    });

    return request;
  });
}
