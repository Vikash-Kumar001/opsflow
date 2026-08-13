import type { RequestTimelineEvent } from "@/features/shared/requests";

import type { TeamRequest } from "../types/manager-request-list.types";

export function buildManagerRequestTimeline(
  request: TeamRequest,
): RequestTimelineEvent[] {
  const events: RequestTimelineEvent[] = [
    {
      id: "created",
      label: "Request created",
      timestamp: request.createdAt,
      description: `${request.requester.name} created ${request.requestNumber}.`,
    },
  ];

  if (request.submittedAt) {
    events.push({
      id: "submitted",
      label: "Request submitted",
      timestamp: request.submittedAt,
      description: "The request entered the team approval queue.",
    });
  }

  if (request.status === "IN_REVIEW") {
    events.push({
      id: "in-review",
      label: "Review started",
      timestamp: request.updatedAt,
      description: request.reviewer
        ? `${request.reviewer.name} started review.`
        : "Review is in progress.",
    });
  }

  if (request.status === "APPROVED" && request.reviewedAt) {
    events.push({
      id: "approved",
      label: "Request approved",
      timestamp: request.reviewedAt,
      description: request.reviewer
        ? `${request.reviewer.name} approved the request.`
        : "The request was approved.",
    });
  }

  if (request.status === "REJECTED" && request.reviewedAt) {
    events.push({
      id: "rejected",
      label: "Request rejected",
      timestamp: request.reviewedAt,
      description: request.reviewer
        ? `${request.reviewer.name} rejected the request.`
        : "The request was rejected.",
    });
  }

  if (request.status === "CANCELLED") {
    events.push({
      id: "cancelled",
      label: "Request cancelled",
      timestamp: request.updatedAt,
      description: "The requester cancelled this request.",
    });
  }

  return events;
}
