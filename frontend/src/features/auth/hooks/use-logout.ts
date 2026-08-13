"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../services/auth.service";
import { authQueryKeys } from "../utils/auth-query-keys";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(authQueryKeys.currentUser, null);
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
    },
  });
}
