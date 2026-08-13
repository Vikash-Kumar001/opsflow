"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { managerDashboardQueryKeys } from "@/features/manager/dashboard/hooks/use-manager-dashboard";

import {
  approveTeamRequest,
  rejectTeamRequest,
  startTeamRequestReview,
} from "../services/manager-request.service";
import type {
  ManagerRejectRequestPayload,
  ManagerReviewNotesPayload,
} from "../types/manager-request-list.types";
import { managerRequestQueryKeys } from "./use-manager-team-requests";

type ReviewNotesVariables = {
  requestId: string;
  payload: ManagerReviewNotesPayload;
};

type RejectRequestVariables = {
  requestId: string;
  payload: ManagerRejectRequestPayload;
};

export function useStartTeamRequestReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: ReviewNotesVariables) =>
      startTeamRequestReview(requestId, payload),
    onSuccess: (_data, variables) => {
      invalidateManagerReviewQueries(queryClient, variables.requestId);
    },
  });
}

export function useApproveTeamRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: ReviewNotesVariables) =>
      approveTeamRequest(requestId, payload),
    onSuccess: (_data, variables) => {
      invalidateManagerReviewQueries(queryClient, variables.requestId);
    },
  });
}

export function useRejectTeamRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: RejectRequestVariables) =>
      rejectTeamRequest(requestId, payload),
    onSuccess: (_data, variables) => {
      invalidateManagerReviewQueries(queryClient, variables.requestId);
    },
  });
}

function invalidateManagerReviewQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  requestId: string,
) {
  queryClient.invalidateQueries({
    queryKey: managerRequestQueryKeys.detail(requestId),
  });
  queryClient.invalidateQueries({ queryKey: managerRequestQueryKeys.all });
  queryClient.invalidateQueries({
    queryKey: managerDashboardQueryKeys.dashboard,
  });
}
