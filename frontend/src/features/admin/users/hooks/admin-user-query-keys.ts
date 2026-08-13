import type { AdminUserListParams } from "../types/admin-user.types";

export const adminUserQueryKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...adminUserQueryKeys.all, "list"] as const,
  list: (params: AdminUserListParams) =>
    [...adminUserQueryKeys.lists(), params] as const,
};
