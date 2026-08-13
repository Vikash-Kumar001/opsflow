import { apiRequest } from "@/lib/api/api-client";

import type {
  RequestCommentData,
  RequestCommentPayload,
  RequestCommentsData,
} from "../types/comment.types";

export function listRequestComments(
  requestId: string,
): Promise<RequestCommentsData> {
  return apiRequest<RequestCommentsData>(`/requests/${requestId}/comments`);
}

export function createRequestComment(
  requestId: string,
  payload: RequestCommentPayload,
): Promise<RequestCommentData> {
  return apiRequest<RequestCommentData>(`/requests/${requestId}/comments`, {
    method: "POST",
    body: payload,
  });
}
