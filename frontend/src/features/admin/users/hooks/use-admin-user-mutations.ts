"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  changeAdminUserRole,
  changeAdminUserStatus,
  createAdminUser,
} from "../services/admin-user.service";
import type {
  ChangeAdminUserRolePayload,
  ChangeAdminUserStatusPayload,
  CreateAdminUserPayload,
} from "../types/admin-user.types";
import { adminUserQueryKeys } from "./admin-user-query-keys";

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.lists() });
    },
  });
}

export function useChangeAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeAdminUserRolePayload) =>
      changeAdminUserRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.lists() });
    },
  });
}

export function useChangeAdminUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeAdminUserStatusPayload) =>
      changeAdminUserStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.lists() });
    },
  });
}
