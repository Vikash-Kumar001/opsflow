import { NotFoundError } from "../../../errors/not-found.error.js";
import type { AdminUserRepositoryClient } from "../../../repositories/admin/users/admin-user.repository.js";
import { findAdminUserById } from "../../../repositories/admin/users/admin-user.repository.js";
import type { UserSummaryRecord } from "../../../serializers/shared/user-summary.serializer.js";

export async function getUserById(
  prisma: AdminUserRepositoryClient,
  id: string,
): Promise<UserSummaryRecord> {
  const user = await findAdminUserById(prisma, id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}
