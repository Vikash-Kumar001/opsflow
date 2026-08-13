"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateEmployeeRequest } from "../services/employee-request.service";
import type { EmployeeRequestFormPayload } from "../types/employee-request-list.types";
import { employeeRequestQueryKeys } from "./employee-request-query-keys";

type UpdateEmployeeRequestVariables = {
  id: string;
  payload: EmployeeRequestFormPayload;
};

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateEmployeeRequestVariables) =>
      updateEmployeeRequest(id, payload),
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
