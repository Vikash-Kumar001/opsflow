import type { RequestSummary } from "@/features/shared/requests";

export type EmployeeDashboardMetrics = {
  totalRequests: number;
  draftRequests: number;
  pendingRequests: number;
  inReviewRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
};

export type EmployeeDashboardData = {
  metrics: EmployeeDashboardMetrics;
  recentRequests: RequestSummary[];
};
