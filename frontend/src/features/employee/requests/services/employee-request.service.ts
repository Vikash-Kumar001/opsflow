import { apiRequest } from "@/lib/api/api-client";

import type {
  EmployeeRequestData,
  EmployeeRequestFormPayload,
  EmployeeRequestListData,
  EmployeeRequestListParams,
} from "../types/employee-request-list.types";

export function listEmployeeRequests(
  params: EmployeeRequestListParams,
): Promise<EmployeeRequestListData> {
  return apiRequest<EmployeeRequestListData>(
    `/requests?${buildRequestListSearchParams(params)}`,
  );
}

export function getEmployeeRequest(id: string): Promise<EmployeeRequestData> {
  return apiRequest<EmployeeRequestData>(`/requests/${id}`);
}

export function createEmployeeRequest(
  payload: EmployeeRequestFormPayload,
): Promise<EmployeeRequestData> {
  return apiRequest<EmployeeRequestData>("/requests", {
    method: "POST",
    body: payload,
  });
}

export function updateEmployeeRequest(
  id: string,
  payload: EmployeeRequestFormPayload,
): Promise<EmployeeRequestData> {
  return apiRequest<EmployeeRequestData>(`/requests/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function submitEmployeeRequest(id: string): Promise<EmployeeRequestData> {
  return apiRequest<EmployeeRequestData>(`/requests/${id}/submit`, {
    method: "PATCH",
  });
}

export function cancelEmployeeRequest(id: string): Promise<EmployeeRequestData> {
  return apiRequest<EmployeeRequestData>(`/requests/${id}/cancel`, {
    method: "PATCH",
  });
}

export function buildRequestListSearchParams(
  params: EmployeeRequestListParams,
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
