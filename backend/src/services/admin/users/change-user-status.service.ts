import { AuthorizationError } from "../../../errors/authorization.error.js";
import { NotFoundError } from "../../../errors/not-found.error.js";
import {
  findAdminUserById,
  updateAdminUserRecord,
  type AdminUserRepositoryClient,
} from "../../../repositories/admin/users/admin-user.repository.js";
import {
  createUserAuditLog,
  type AuditLogRepositoryClient,
} from "../../../repositories/shared/audit-log.repository.js";
import type { UserSummaryRecord } from "../../../serializers/shared/user-summary.serializer.js";
import { assertNotLastActiveAdmin } from "./change-user-role.service.js";

export type ChangeUserStatusClient = AdminUserRepositoryClient &
  AuditLogRepositoryClient & {
    $transaction<T>(
      callback: (transaction: ChangeUserStatusClient) => Promise<T>,
    ): Promise<T>;
  };

export async function changeUserStatus(
  prisma: ChangeUserStatusClient,
  actorId: string,
  userId: string,
  isActive: boolean,
): Promise<UserSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const user = await findAdminUserById(transaction, userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!isActive && userId === actorId) {
      throw new AuthorizationError("Admins cannot deactivate themselves");
    }

    if (user.isActive === isActive) {
      return user;
    }

    if (user.role === "ADMIN" && user.isActive && !isActive) {
      await assertNotLastActiveAdmin(transaction);
    }

    const updatedUser = await updateAdminUserRecord(transaction, userId, {
      isActive,
    });

    await createUserAuditLog(transaction, {
      actorId,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      userId,
      metadata: {
        fromIsActive: user.isActive,
        toIsActive: updatedUser.isActive,
      },
    });

    return updatedUser;
  });
}
