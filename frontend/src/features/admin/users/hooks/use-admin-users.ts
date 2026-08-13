"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listAdminUsers } from "../services/admin-user.service";
import type { AdminUserListParams } from "../types/admin-user.types";
import { adminUserQueryKeys } from "./admin-user-query-keys";

export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminUserQueryKeys.list(params),
    queryFn: () => listAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}
