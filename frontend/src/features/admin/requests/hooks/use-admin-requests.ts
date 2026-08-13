"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getAdminRequest,
  listAdminRequests,
} from "../services/admin-request.service";
import type { AdminRequestListParams } from "../types/admin-request.types";
import { adminRequestQueryKeys } from "./admin-request-query-keys";

export function useAdminRequests(params: AdminRequestListParams) {
  return useQuery({
    queryKey: adminRequestQueryKeys.list(params),
    queryFn: () => listAdminRequests(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminRequest(id: string) {
  return useQuery({
    queryKey: adminRequestQueryKeys.detail(id),
    queryFn: () => getAdminRequest(id),
    enabled: Boolean(id),
  });
}
