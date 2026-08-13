"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listEmployeeRequests } from "../services/employee-request.service";
import type { EmployeeRequestListParams } from "../types/employee-request-list.types";
import { employeeRequestQueryKeys } from "./employee-request-query-keys";

export function useEmployeeRequests(params: EmployeeRequestListParams) {
  return useQuery({
    queryKey: employeeRequestQueryKeys.list(params),
    queryFn: () => listEmployeeRequests(params),
    placeholderData: keepPreviousData,
  });
}
