"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelEmployeeRequest,
  submitEmployeeRequest,
} from "../services/employee-request.service";
import { employeeRequestQueryKeys } from "./employee-request-query-keys";

export function useSubmitRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => submitEmployeeRequest(requestId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        employeeRequestQueryKeys.detail(data.request.id),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: employeeRequestQueryKeys.lists(),
      });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => cancelEmployeeRequest(requestId),
    onSuccess: (data) => {
      queryClient.setQueryData(
        employeeRequestQueryKeys.detail(data.request.id),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: employeeRequestQueryKeys.lists(),
      });
    },
  });
}
