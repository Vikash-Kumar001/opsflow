"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../services/auth.service";
import type { AuthUser, LoginRequest } from "../types/auth.types";
import { authQueryKeys } from "../utils/auth-query-keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}
