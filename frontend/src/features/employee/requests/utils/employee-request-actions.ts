import type { RequestStatus } from "@/features/shared/requests";

const EDITABLE_STATUSES = ["DRAFT", "PENDING"] as const;
const CANCELLABLE_STATUSES = ["DRAFT", "PENDING"] as const;

export function canEmployeeEditRequest(status: RequestStatus): boolean {
  return (EDITABLE_STATUSES as readonly RequestStatus[]).includes(status);
}

export function canEmployeeSubmitRequest(status: RequestStatus): boolean {
  return status === "DRAFT";
}

export function canEmployeeCancelRequest(status: RequestStatus): boolean {
  return (CANCELLABLE_STATUSES as readonly RequestStatus[]).includes(status);
}
