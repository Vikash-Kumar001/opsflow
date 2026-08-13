import { createInvalidCredentialsError } from "./auth-errors.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import {
  findAuthUserById,
  updateAuthUserPassword,
  type AuthUserPasswordRepositoryClient,
  type AuthUserRepositoryClient,
} from "../../repositories/shared/auth-user.repository.js";
import {
  serializeUserSummary,
  type SerializedUserSummary,
} from "../../serializers/shared/user-summary.serializer.js";
import type { ChangePasswordBody } from "../../validators/auth/change-password.schema.js";

export async function changeCurrentUserPassword(
  prisma: AuthUserRepositoryClient & AuthUserPasswordRepositoryClient,
  userId: string,
  input: ChangePasswordBody,
): Promise<SerializedUserSummary> {
  const user = await findAuthUserById(prisma, userId);

  if (!user || !user.isActive) {
    throw createInvalidCredentialsError();
  }

  const currentPasswordMatches = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    throw createInvalidCredentialsError();
  }

  const passwordHash = await hashPassword(input.newPassword);
  const updatedUser = await updateAuthUserPassword(
    prisma,
    user.id,
    passwordHash,
  );

  return serializeUserSummary(updatedUser);
}
