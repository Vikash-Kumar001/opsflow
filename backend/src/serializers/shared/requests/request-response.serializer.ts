import type { PaginationMeta } from "../../../utils/pagination.js";
import {
  serializeRequestSummary,
  type RequestSummaryRecord,
  type SerializedRequestSummary,
} from "../request-summary.serializer.js";
import { serializePagination } from "../pagination.serializer.js";

export type SerializedRequestListResponse = {
  requests: SerializedRequestSummary[];
  pagination: PaginationMeta;
};

export function serializeRequestResponse(request: RequestSummaryRecord): {
  request: SerializedRequestSummary;
} {
  return {
    request: serializeRequestSummary(request),
  };
}

export function serializeRequestListResponse(
  requests: RequestSummaryRecord[],
  pagination: PaginationMeta,
): SerializedRequestListResponse {
  return {
    requests: requests.map(serializeRequestSummary),
    pagination: serializePagination(pagination),
  };
}
