import type {
  RequestSummary,
  RequestTimelineEvent,
} from "@/features/shared/requests";

export function buildAdminRequestTimeline(
  request: RequestSummary,
): RequestTimelineEvent[] {
  const events: RequestTimelineEvent[] = [
    {
      id: "created",
      label: "Request created",
      timestamp: request.createdAt,
      description: `${request.createdBy.name} created ${request.requestNumber}.`,
    },
  ];

  if (request.submittedAt) {
    events.push({
      id: "submitted",
      label: "Request submitted",
      timestamp: request.submittedAt,
      description: "The request entered the review workflow.",
    });
  }

  if (request.status === "IN_REVIEW") {
    events.push({
      id: "in-review",
      label: "Review in progress",
      timestamp: request.updatedAt,
      description: "A reviewer is currently evaluating this request.",
    });
  }

  if (request.status === "APPROVED" && request.reviewedAt) {
    events.push({
      id: "approved",
      label: "Request approved",
      timestamp: request.reviewedAt,
      description: request.reviewedBy
        ? `${request.reviewedBy.name} approved the request.`
        : "The request was approved.",
    });
  }

  if (request.status === "REJECTED" && request.reviewedAt) {
    events.push({
      id: "rejected",
      label: "Request rejected",
      timestamp: request.reviewedAt,
      description: request.reviewedBy
        ? `${request.reviewedBy.name} rejected the request.`
        : "The request was rejected.",
    });
  }

  if (request.status === "CANCELLED") {
    events.push({
      id: "cancelled",
      label: "Request cancelled",
      timestamp: request.updatedAt,
      description: "The request was cancelled by the requester.",
    });
  }

  if (request.deletedAt) {
    events.push({
      id: "archived",
      label: "Request archived",
      timestamp: request.deletedAt,
      description: "An Admin archived this request.",
    });
  }

  return events;
}
