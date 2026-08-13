import { apiRequest } from "@/lib/api/api-client";

import type {
  ManagerRejectRequestPayload,
  ManagerRequestListData,
  ManagerRequestListParams,
  ManagerReviewNotesPayload,
  TeamRequestData,
} from "../types/manager-request-list.types";

export function listTeamRequests(
  params: ManagerRequestListParams,
): Promise<ManagerRequestListData> {
  return apiRequest<ManagerRequestListData>(
    `/manager/requests?${buildTeamRequestListSearchParams(params)}`,
  );
}

export function getTeamRequest(id: string): Promise<TeamRequestData> {
  return apiRequest<TeamRequestData>(`/manager/requests/${id}`);
}

export function startTeamRequestReview(
  id: string,
  payload: ManagerReviewNotesPayload,
): Promise<TeamRequestData> {
  return apiRequest<TeamRequestData>(`/manager/requests/${id}/start-review`, {
    method: "PATCH",
    body: payload,
  });
}

export function approveTeamRequest(
  id: string,
  payload: ManagerReviewNotesPayload,
): Promise<TeamRequestData> {
  return apiRequest<TeamRequestData>(`/manager/requests/${id}/approve`, {
    method: "PATCH",
    body: payload,
  });
}

export function rejectTeamRequest(
  id: string,
  payload: ManagerRejectRequestPayload,
): Promise<TeamRequestData> {
  return apiRequest<TeamRequestData>(`/manager/requests/${id}/reject`, {
    method: "PATCH",
    body: payload,
  });
}

export function buildTeamRequestListSearchParams(
  params: ManagerRequestListParams,
): string {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  searchParams.set("sortBy", params.sortBy);
  searchParams.set("sortDirection", params.sortDirection);

  const optionalParams = {
    search: params.search,
    status: params.status,
    category: params.category,
    priority: params.priority,
  };

  for (const [key, value] of Object.entries(optionalParams)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
