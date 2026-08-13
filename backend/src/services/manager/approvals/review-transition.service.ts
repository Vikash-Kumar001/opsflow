import type { RequestStatus } from "../../../domain/request/request.constants.js";
import { assertRequestStatusTransition } from "../../../domain/request/request-transitions.js";
import { AuthorizationError } from "../../../errors/authorization.error.js";
import { InvalidTransitionError } from "../../../errors/invalid-transition.error.js";
import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import {
  createRequestAuditLog,
  type AuditAction,
} from "../../../repositories/shared/audit-log.repository.js";
import {
  findManagerReviewTargetById,
  updateManagerTeamRequestForReview,
} from "../../../repositories/manager/requests/manager-request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

type ReviewTransitionInput = {
  id: string;
  targetStatus: Extract<RequestStatus, "IN_REVIEW" | "APPROVED" | "REJECTED">;
  auditAction: Extract<
    AuditAction,
    "REQUEST_REVIEW_STARTED" | "REQUEST_APPROVED" | "REQUEST_REJECTED"
  >;
  reviewNotes?: string | undefined;
  rejectionReason?: string | undefined;
};

export async function applyManagerReviewTransition(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  input: ReviewTransitionInput,
): Promise<RequestSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const request = await findReviewableTeamRequest(
      transaction,
      actor,
      input.id,
    );

    if (request.status === input.targetStatus) {
      return request;
    }

    assertRequestStatusTransition(request.status, input.targetStatus);

    const reviewedAt = new Date();
    const updated = await updateManagerTeamRequestForReview(
      transaction,
      actor.id,
      input.id,
      request.status,
      {
        status: input.targetStatus,
        reviewedById: actor.id,
        reviewedAt,
        reviewNotes: input.reviewNotes ?? null,
        rejectionReason: input.rejectionReason ?? null,
      },
    );

    if (!updated) {
      return handleCompetingReviewTransition(transaction, actor, input);
    }

    const updatedRequest = await findReviewableTeamRequest(
      transaction,
      actor,
      input.id,
    );

    await createRequestAuditLog(transaction, {
      actorId: actor.id,
      action: input.auditAction,
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

async function handleCompetingReviewTransition(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  input: ReviewTransitionInput,
): Promise<RequestSummaryRecord> {
  const currentRequest = await findReviewableTeamRequest(
    prisma,
    actor,
    input.id,
  );

  if (currentRequest.status === input.targetStatus) {
    return currentRequest;
  }

  throw new InvalidTransitionError(
    `Cannot transition request from ${currentRequest.status} to ${input.targetStatus}.`,
    {
      fromStatus: currentRequest.status,
      toStatus: input.targetStatus,
    },
  );
}

async function findReviewableTeamRequest(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  id: string,
): Promise<RequestSummaryRecord> {
  const request = await findManagerReviewTargetById(prisma, actor.id, id);

  if (!request) {
    throw new NotFoundError("Request not found");
  }

  if (request.createdById === actor.id) {
    throw new AuthorizationError("Managers cannot review their own requests");
  }

  return request;
}
