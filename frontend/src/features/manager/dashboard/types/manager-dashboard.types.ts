import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
  RequestUserSummary,
} from "@/features/shared/requests";

export type ManagerDashboardMetrics = {
  pendingApprovals: number;
  inReview: number;
  approvedRecent: number;
  rejectedRecent: number;
  urgentRequests: number;
};

export type TeamDashboardRequest = {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  reviewNotes: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: RequestUserSummary;
  reviewer: RequestUserSummary | null;
};

export type ManagerDashboardData = {
  metrics: ManagerDashboardMetrics;
  recentPeriodDays: number;
  recentTeamRequests: TeamDashboardRequest[];
};
