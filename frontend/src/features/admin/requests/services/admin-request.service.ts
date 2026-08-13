import { apiRequest } from "@/lib/api/api-client";

import type {
  AdminRequestData,
  AdminRequestListData,
  AdminRequestListParams,
} from "../types/admin-request.types";

export function listAdminRequests(
  params: AdminRequestListParams,
): Promise<AdminRequestListData> {
  return apiRequest<AdminRequestListData>(
    `/admin/requests?${buildAdminRequestListSearchParams(params)}`,
  );
}

export function getAdminRequest(id: string): Promise<AdminRequestData> {
  return apiRequest<AdminRequestData>(`/admin/requests/${id}`);
}

export function deleteAdminRequest(id: string): Promise<AdminRequestData> {
  return apiRequest<AdminRequestData>(`/requests/${id}`, {
    method: "DELETE",
  });
}

export function buildAdminRequestListSearchParams(
  params: AdminRequestListParams,
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
    createdFrom: params.createdFrom,
    createdTo: params.createdTo,
  };

  for (const [key, value] of Object.entries(optionalParams)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
