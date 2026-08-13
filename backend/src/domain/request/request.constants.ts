export const REQUEST_STATUSES = [
  "DRAFT",
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export const REQUEST_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const REQUEST_CATEGORIES = [
  "LEAVE",
  "EXPENSE",
  "EQUIPMENT",
  "SOFTWARE_ACCESS",
  "WORK_FROM_HOME",
  "TRAVEL",
  "PROCUREMENT",
  "OTHER",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const DEFAULT_REQUEST_STATUS = "DRAFT" satisfies RequestStatus;
export const DEFAULT_REQUEST_PRIORITY = "MEDIUM" satisfies RequestPriority;
export const REQUEST_NUMBER_PREFIX = "REQ";
