import type { RequestStatus } from "./request.constants.js";

export const TERMINAL_REQUEST_STATUSES = [
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export const EMPLOYEE_EDITABLE_REQUEST_STATUSES = ["DRAFT", "PENDING"] as const;

export const EMPLOYEE_CANCELLABLE_REQUEST_STATUSES = [
  "DRAFT",
  "PENDING",
] as const;

export const REVIEWABLE_REQUEST_STATUSES = ["PENDING", "IN_REVIEW"] as const;

export function isTerminalRequestStatus(status: RequestStatus): boolean {
  return (TERMINAL_REQUEST_STATUSES as readonly RequestStatus[]).includes(
    status,
  );
}

export function isEmployeeEditableRequestStatus(
  status: RequestStatus,
): boolean {
  return (
    EMPLOYEE_EDITABLE_REQUEST_STATUSES as readonly RequestStatus[]
  ).includes(status);
}

export function isEmployeeCancellableRequestStatus(
  status: RequestStatus,
): boolean {
  return (
    EMPLOYEE_CANCELLABLE_REQUEST_STATUSES as readonly RequestStatus[]
  ).includes(status);
}

export function isReviewableRequestStatus(status: RequestStatus): boolean {
  return (REVIEWABLE_REQUEST_STATUSES as readonly RequestStatus[]).includes(
    status,
  );
}
