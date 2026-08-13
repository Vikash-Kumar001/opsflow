import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
  RequestUserSummary,
} from "@/features/shared/requests";

export const MANAGER_REQUEST_SORT_OPTIONS = [
  "createdAt",
  "updatedAt",
  "submittedAt",
  "priority",
  "title",
] as const;

export type ManagerRequestSortBy = (typeof MANAGER_REQUEST_SORT_OPTIONS)[number];
export type ManagerRequestSortDirection = "asc" | "desc";

export type TeamRequest = {
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

export type ManagerRequestListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: RequestStatus;
  category?: RequestCategory;
  priority?: RequestPriority;
  sortBy: ManagerRequestSortBy;
  sortDirection: ManagerRequestSortDirection;
};

export type ManagerRequestListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ManagerRequestListData = {
  requests: TeamRequest[];
  pagination: ManagerRequestListPagination;
};

export type TeamRequestData = {
  request: TeamRequest;
};

export type ManagerReviewNotesPayload = {
  reviewNotes?: string;
};

export type ManagerRejectRequestPayload = {
  rejectionReason: string;
  reviewNotes?: string;
};
