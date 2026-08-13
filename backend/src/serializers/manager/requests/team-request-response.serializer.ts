import type { PaginationMeta } from "../../../utils/pagination.js";
import { serializePagination } from "../../shared/pagination.serializer.js";
import type { RequestSummaryRecord } from "../../shared/request-summary.serializer.js";
import {
  serializeUserSummary,
  type SerializedUserSummary,
} from "../../shared/user-summary.serializer.js";

export type SerializedTeamRequest = {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  category: RequestSummaryRecord["category"];
  priority: RequestSummaryRecord["priority"];
  status: RequestSummaryRecord["status"];
  reviewNotes: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: SerializedUserSummary;
  reviewer: SerializedUserSummary | null;
};

export function serializeTeamRequest(
  request: RequestSummaryRecord,
): SerializedTeamRequest {
  return {
    id: request.id,
    requestNumber: request.requestNumber,
    title: request.title,
    description: request.description,
    category: request.category,
    priority: request.priority,
    status: request.status,
    reviewNotes: request.reviewNotes,
    rejectionReason: request.rejectionReason,
    submittedAt: request.submittedAt?.toISOString() ?? null,
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    requester: serializeUserSummary(request.createdBy),
    reviewer: request.reviewedBy
      ? serializeUserSummary(request.reviewedBy)
      : null,
  };
}

export function serializeTeamRequestResponse(request: RequestSummaryRecord): {
  request: SerializedTeamRequest;
} {
  return {
    request: serializeTeamRequest(request),
  };
}

export function serializeTeamRequestListResponse(
  requests: RequestSummaryRecord[],
  pagination: PaginationMeta,
): {
  requests: SerializedTeamRequest[];
  pagination: PaginationMeta;
} {
  return {
    requests: requests.map(serializeTeamRequest),
    pagination: serializePagination(pagination),
  };
}
