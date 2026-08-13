"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changePassword } from "../services/auth.service";
import type { ChangePasswordRequest } from "../types/auth.types";
import { authQueryKeys } from "../utils/auth-query-keys";

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
    },
  });
}
