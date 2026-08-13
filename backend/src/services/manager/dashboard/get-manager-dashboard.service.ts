import type { PrismaClientLike } from "../../../lib/prisma.js";
import {
  countManagerTeamRequests,
  listRecentManagerTeamRequests,
} from "../../../repositories/manager/requests/manager-request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

const RECENT_REVIEW_PERIOD_DAYS = 30;
const RECENT_TEAM_REQUEST_LIMIT = 5;

export type ManagerDashboardResult = {
  metrics: {
    pendingApprovals: number;
    inReview: number;
    approvedRecent: number;
    rejectedRecent: number;
    urgentRequests: number;
  };
  recentPeriodDays: number;
  recentTeamRequests: RequestSummaryRecord[];
};

export async function getManagerDashboard(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
): Promise<ManagerDashboardResult> {
  const reviewedFrom = new Date(
    Date.now() - RECENT_REVIEW_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  );

  const [
    pendingApprovals,
    inReview,
    approvedRecent,
    rejectedRecent,
    urgentRequests,
    recentTeamRequests,
  ] = await Promise.all([
    countManagerTeamRequests(prisma, actor.id, { status: "PENDING" }),
    countManagerTeamRequests(prisma, actor.id, { status: "IN_REVIEW" }),
    countManagerTeamRequests(prisma, actor.id, {
      status: "APPROVED",
      reviewedFrom,
    }),
    countManagerTeamRequests(prisma, actor.id, {
      status: "REJECTED",
      reviewedFrom,
    }),
    countManagerTeamRequests(prisma, actor.id, { priority: "URGENT" }),
    listRecentManagerTeamRequests(prisma, actor.id, RECENT_TEAM_REQUEST_LIMIT),
  ]);

  return {
    metrics: {
      pendingApprovals,
      inReview,
      approvedRecent,
      rejectedRecent,
      urgentRequests,
    },
    recentPeriodDays: RECENT_REVIEW_PERIOD_DAYS,
    recentTeamRequests,
  };
}
