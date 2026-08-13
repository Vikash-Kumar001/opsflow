import type { AdminRequestListParams } from "../types/admin-request.types";

export const adminRequestQueryKeys = {
  all: ["admin", "requests"] as const,
  lists: () => [...adminRequestQueryKeys.all, "list"] as const,
  list: (params: AdminRequestListParams) =>
    [...adminRequestQueryKeys.lists(), params] as const,
  details: () => [...adminRequestQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...adminRequestQueryKeys.details(), id] as const,
};
