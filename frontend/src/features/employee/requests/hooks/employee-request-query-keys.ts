import type { EmployeeRequestListParams } from "../types/employee-request-list.types";

export const employeeRequestQueryKeys = {
  all: ["employee", "requests"] as const,
  lists: () => [...employeeRequestQueryKeys.all, "list"] as const,
  list: (params: EmployeeRequestListParams) =>
    [...employeeRequestQueryKeys.lists(), params] as const,
  detail: (id: string) => [...employeeRequestQueryKeys.all, "detail", id] as const,
  comments: (id: string) =>
    [...employeeRequestQueryKeys.all, "detail", id, "comments"] as const,
};
