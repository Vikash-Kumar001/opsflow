"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getTeamRequest,
  listTeamRequests,
} from "../services/manager-request.service";
import type { ManagerRequestListParams } from "../types/manager-request-list.types";

export const managerRequestQueryKeys = {
  all: ["manager", "requests"] as const,
  teamRequests: (params: ManagerRequestListParams) =>
    [...managerRequestQueryKeys.all, "team", params] as const,
  detail: (id: string) => [...managerRequestQueryKeys.all, "detail", id] as const,
};

export function useManagerTeamRequests(params: ManagerRequestListParams) {
  return useQuery({
    queryKey: managerRequestQueryKeys.teamRequests(params),
    queryFn: () => listTeamRequests(params),
    placeholderData: keepPreviousData,
  });
}

export function useManagerTeamRequest(requestId: string) {
  return useQuery({
    queryKey: managerRequestQueryKeys.detail(requestId),
    queryFn: () => getTeamRequest(requestId),
    enabled: Boolean(requestId),
  });
}
