import {
  countEmployeeRequests,
  listRecentEmployeeRequests,
  type EmployeeDashboardRepositoryClient,
} from "../../../repositories/employee/dashboard/employee-dashboard.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";

const RECENT_REQUEST_LIMIT = 5;

export type EmployeeDashboardResult = {
  metrics: {
    totalRequests: number;
    draftRequests: number;
    pendingRequests: number;
    inReviewRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    cancelledRequests: number;
  };
  recentRequests: RequestSummaryRecord[];
};

export async function getEmployeeDashboard(
  prisma: EmployeeDashboardRepositoryClient,
  actor: SerializedUserSummary,
): Promise<EmployeeDashboardResult> {
  const [
    totalRequests,
    draftRequests,
    pendingRequests,
    inReviewRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,
    recentRequests,
  ] = await Promise.all([
    countEmployeeRequests(prisma, actor.id),
    countEmployeeRequests(prisma, actor.id, "DRAFT"),
    countEmployeeRequests(prisma, actor.id, "PENDING"),
    countEmployeeRequests(prisma, actor.id, "IN_REVIEW"),
    countEmployeeRequests(prisma, actor.id, "APPROVED"),
    countEmployeeRequests(prisma, actor.id, "REJECTED"),
    countEmployeeRequests(prisma, actor.id, "CANCELLED"),
    listRecentEmployeeRequests(prisma, actor.id, RECENT_REQUEST_LIMIT),
  ]);

  return {
    metrics: {
      totalRequests,
      draftRequests,
      pendingRequests,
      inReviewRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
    },
    recentRequests,
  };
}
