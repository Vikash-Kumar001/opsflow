import type { PrismaClientLike } from "../../../lib/prisma.js";
import { applyManagerReviewTransition } from "./review-transition.service.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

export async function approveTeamRequest(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  id: string,
  input: { reviewNotes?: string | undefined },
): Promise<RequestSummaryRecord> {
  return applyManagerReviewTransition(prisma, actor, {
    id,
    targetStatus: "APPROVED",
    auditAction: "REQUEST_APPROVED",
    reviewNotes: input.reviewNotes,
  });
}
