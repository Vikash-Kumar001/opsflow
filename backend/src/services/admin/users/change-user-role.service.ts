import type { UserRole } from "../../../domain/user/user.types.js";
import { ConflictError } from "../../../errors/conflict.error.js";
import { NotFoundError } from "../../../errors/not-found.error.js";
import {
  countActiveAdmins,
  findAdminUserById,
  updateAdminUserRecord,
  type AdminUserRepositoryClient,
} from "../../../repositories/admin/users/admin-user.repository.js";
import {
  createUserAuditLog,
  type AuditLogRepositoryClient,
} from "../../../repositories/shared/audit-log.repository.js";
import type { UserSummaryRecord } from "../../../serializers/shared/user-summary.serializer.js";

export type ChangeUserRoleClient = AdminUserRepositoryClient &
  AuditLogRepositoryClient & {
    $transaction<T>(
      callback: (transaction: ChangeUserRoleClient) => Promise<T>,
    ): Promise<T>;
  };

export async function changeUserRole(
  prisma: ChangeUserRoleClient,
  actorId: string,
  userId: string,
  role: UserRole,
): Promise<UserSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const user = await findAdminUserById(transaction, userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role === role) {
      return user;
    }

    if (user.role === "ADMIN" && user.isActive && role !== "ADMIN") {
      await assertNotLastActiveAdmin(transaction);
    }

    const updatedUser = await updateAdminUserRecord(transaction, userId, {
      role,
    });

    await createUserAuditLog(transaction, {
      actorId,
      action: "USER_ROLE_CHANGED",
      userId,
      metadata: {
        fromRole: user.role,
        toRole: updatedUser.role,
      },
    });

    return updatedUser;
  });
}

export async function assertNotLastActiveAdmin(
  prisma: AdminUserRepositoryClient,
): Promise<void> {
  const activeAdminCount = await countActiveAdmins(prisma);

  if (activeAdminCount <= 1) {
    throw new ConflictError("Cannot modify the last active Admin");
  }
}
