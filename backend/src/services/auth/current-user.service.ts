import { AuthenticationError } from "../../errors/authentication.error.js";
import {
  findAuthUserById,
  type AuthUserRepositoryClient,
} from "../../repositories/shared/auth-user.repository.js";
import {
  serializeUserSummary,
  type SerializedUserSummary,
} from "../../serializers/shared/user-summary.serializer.js";
import { assertActiveUser } from "./login.service.js";
import { verifyAuthToken } from "./token.service.js";

type CurrentUserEnv = {
  JWT_SECRET: string;
};

export async function getCurrentActiveUserFromToken(
  prisma: AuthUserRepositoryClient,
  token: string | undefined,
  env: CurrentUserEnv,
): Promise<SerializedUserSummary> {
  if (!token) {
    throw new AuthenticationError();
  }

  const payload = verifyAuthToken(token, env);
  const user = await findAuthUserById(prisma, payload.sub);

  if (!user) {
    throw new AuthenticationError();
  }

  assertActiveUser(user.isActive);

  return serializeUserSummary(user);
}
