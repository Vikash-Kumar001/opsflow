"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEmployeeRequest } from "../services/employee-request.service";
import type { EmployeeRequestFormPayload } from "../types/employee-request-list.types";
import { employeeRequestQueryKeys } from "./employee-request-query-keys";

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeRequestFormPayload) =>
      createEmployeeRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: employeeRequestQueryKeys.lists(),
      });
      queryClient.setQueryData(
        employeeRequestQueryKeys.detail(data.request.id),
        data,
      );
    },
  });
}
