import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
  RequestSummary,
} from "@/features/shared/requests";

export const REQUEST_SORT_OPTIONS = [
  "createdAt",
  "updatedAt",
  "submittedAt",
  "priority",
  "title",
] as const;

export type RequestSortBy = (typeof REQUEST_SORT_OPTIONS)[number];
export type SortDirection = "asc" | "desc";

export type EmployeeRequestListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: RequestStatus;
  category?: RequestCategory;
  priority?: RequestPriority;
  sortBy: RequestSortBy;
  sortDirection: SortDirection;
};

export type EmployeeRequestListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type EmployeeRequestListData = {
  requests: RequestSummary[];
  pagination: EmployeeRequestListPagination;
};

export type EmployeeRequestData = {
  request: RequestSummary;
};

export type EmployeeRequestFormPayload = {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
};
