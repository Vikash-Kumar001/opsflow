import { apiRequest } from "@/lib/api/api-client";

import type {
  AdminUserData,
  AdminUserListData,
  AdminUserListParams,
  ChangeAdminUserRolePayload,
  ChangeAdminUserStatusPayload,
  CreateAdminUserPayload,
} from "../types/admin-user.types";

export function listAdminUsers(
  params: AdminUserListParams,
): Promise<AdminUserListData> {
  return apiRequest<AdminUserListData>(
    `/admin/users?${buildAdminUserListSearchParams(params)}`,
  );
}

export function createAdminUser(
  payload: CreateAdminUserPayload,
): Promise<AdminUserData> {
  return apiRequest<AdminUserData>("/admin/users", {
    method: "POST",
    body: payload,
  });
}

export function changeAdminUserRole({
  id,
  role,
}: ChangeAdminUserRolePayload): Promise<AdminUserData> {
  return apiRequest<AdminUserData>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
}

export function changeAdminUserStatus({
  id,
  isActive,
}: ChangeAdminUserStatusPayload): Promise<AdminUserData> {
  return apiRequest<AdminUserData>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}

export function buildAdminUserListSearchParams(
  params: AdminUserListParams,
): string {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.role) {
    searchParams.set("role", params.role);
  }

  if (params.status) {
    searchParams.set("isActive", String(params.status === "active"));
  }

  return searchParams.toString();
}
