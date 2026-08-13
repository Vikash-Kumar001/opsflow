"use client";

import { useQuery } from "@tanstack/react-query";

import { getEmployeeRequest } from "../services/employee-request.service";
import { employeeRequestQueryKeys } from "./employee-request-query-keys";

export function useEmployeeRequest(id: string) {
  return useQuery({
    queryKey: employeeRequestQueryKeys.detail(id),
    queryFn: () => getEmployeeRequest(id),
    enabled: Boolean(id),
  });
}
