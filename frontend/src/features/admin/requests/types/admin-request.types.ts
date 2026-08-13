import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
  RequestSummary,
} from "@/features/shared/requests";

export const ADMIN_REQUEST_SORT_OPTIONS = [
  "createdAt",
  "updatedAt",
  "submittedAt",
  "priority",
  "title",
] as const;

export type AdminRequestSortBy = (typeof ADMIN_REQUEST_SORT_OPTIONS)[number];
export type AdminRequestSortDirection = "asc" | "desc";

export type AdminRequestListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: RequestStatus;
  category?: RequestCategory;
  priority?: RequestPriority;
  createdFrom?: string;
  createdTo?: string;
  sortBy: AdminRequestSortBy;
  sortDirection: AdminRequestSortDirection;
};

export type AdminRequestListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminRequestListData = {
  requests: RequestSummary[];
  pagination: AdminRequestListPagination;
};

export type AdminRequestData = {
  request: RequestSummary;
};
