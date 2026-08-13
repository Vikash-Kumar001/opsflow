import { InvalidTransitionError } from "../../errors/invalid-transition.error.js";
import type { RequestStatus } from "./request.constants.js";

export const REQUEST_STATUS_TRANSITIONS = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
} as const satisfies Record<RequestStatus, readonly RequestStatus[]>;

export function getValidRequestTransitions(
  fromStatus: RequestStatus,
): readonly RequestStatus[] {
  return REQUEST_STATUS_TRANSITIONS[fromStatus];
}

export function canTransitionRequestStatus(
  fromStatus: RequestStatus,
  toStatus: RequestStatus,
): boolean {
  return (
    REQUEST_STATUS_TRANSITIONS[fromStatus] as readonly RequestStatus[]
  ).includes(toStatus);
}

export function assertRequestStatusTransition(
  fromStatus: RequestStatus,
  toStatus: RequestStatus,
): void {
  if (!canTransitionRequestStatus(fromStatus, toStatus)) {
    throw new InvalidTransitionError(
      `Cannot transition request from ${fromStatus} to ${toStatus}.`,
      {
        fromStatus,
        toStatus,
        allowedTransitions: getValidRequestTransitions(fromStatus),
      },
    );
  }
}
