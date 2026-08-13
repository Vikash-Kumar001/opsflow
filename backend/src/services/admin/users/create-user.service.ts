import { ConflictError } from "../../../errors/conflict.error.js";
import {
  createUserAuditLog,
  type AuditLogRepositoryClient,
} from "../../../repositories/shared/audit-log.repository.js";
import {
  createAdminUserRecord,
  findAdminUserByEmail,
  type AdminUserRepositoryClient,
} from "../../../repositories/admin/users/admin-user.repository.js";
import { normalizeEmail } from "../../../repositories/shared/auth-user.repository.js";
import type { UserSummaryRecord } from "../../../serializers/shared/user-summary.serializer.js";
import { hashPassword } from "../../auth/password.service.js";
import type { CreateAdminUserBody } from "../../../validators/admin/users/admin-user.schemas.js";

export type CreateUserClient = AdminUserRepositoryClient &
  AuditLogRepositoryClient & {
    $transaction<T>(
      callback: (transaction: CreateUserClient) => Promise<T>,
    ): Promise<T>;
  };

export async function createUser(
  prisma: CreateUserClient,
  actorId: string,
  input: CreateAdminUserBody,
): Promise<UserSummaryRecord> {
  const email = normalizeEmail(input.email);
  const existingUser = await findAdminUserByEmail(prisma, email);

  if (existingUser) {
    throw new ConflictError("Email is already in use");
  }

  return prisma.$transaction(async (transaction) => {
    const user = await createAdminUserRecord(transaction, {
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      isActive: input.isActive ?? true,
      managerId: input.managerId ?? null,
    });

    await createUserAuditLog(transaction, {
      actorId,
      action: "USER_CREATED",
      userId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });

    return user;
  });
}
