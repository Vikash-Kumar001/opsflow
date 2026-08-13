import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../types/request.types";

export const REQUEST_STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING: "Pending",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const satisfies Record<RequestStatus, string>;

export const REQUEST_PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} as const satisfies Record<RequestPriority, string>;

export const REQUEST_CATEGORY_LABELS = {
  LEAVE: "Leave",
  EXPENSE: "Expense",
  EQUIPMENT: "Equipment",
  SOFTWARE_ACCESS: "Software access",
  WORK_FROM_HOME: "Work from home",
  TRAVEL: "Travel",
  PROCUREMENT: "Procurement",
  OTHER: "Other",
} as const satisfies Record<RequestCategory, string>;
