"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAdminRequest } from "../services/admin-request.service";
import { adminRequestQueryKeys } from "./admin-request-query-keys";

export function useDeleteAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminRequestQueryKeys.lists() });
      queryClient.setQueryData(
        adminRequestQueryKeys.detail(data.request.id),
        data,
      );
    },
  });
}
