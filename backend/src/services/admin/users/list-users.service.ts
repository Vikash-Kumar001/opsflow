import {
  buildPaginationMeta,
  parsePagination,
} from "../../../utils/pagination.js";
import type { AdminUserRepositoryClient } from "../../../repositories/admin/users/admin-user.repository.js";
import { listAdminUsers } from "../../../repositories/admin/users/admin-user.repository.js";
import type { UserSummaryRecord } from "../../../serializers/shared/user-summary.serializer.js";
import type { ListAdminUsersQuery } from "../../../validators/admin/users/admin-user.schemas.js";

export type ListUsersResult = {
  users: UserSummaryRecord[];
  pagination: ReturnType<typeof buildPaginationMeta>;
};

export async function listUsers(
  prisma: AdminUserRepositoryClient,
  query: ListAdminUsersQuery,
): Promise<ListUsersResult> {
  const paginationParams = parsePagination(query);
  const filters = {
    skip: paginationParams.skip,
    take: paginationParams.take,
  };

  for (const key of ["search", "role", "isActive"] as const) {
    const value = query[key];

    if (value !== undefined) {
      Object.assign(filters, { [key]: value });
    }
  }

  const result = await listAdminUsers(prisma, filters);

  return {
    users: result.users,
    pagination: buildPaginationMeta(paginationParams, result.total),
  };
}
