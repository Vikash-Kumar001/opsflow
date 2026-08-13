import { AuthenticationError } from "../../errors/authentication.error.js";
import {
  findAuthUserByEmail,
  type AuthUserRepositoryClient,
} from "../../repositories/shared/auth-user.repository.js";
import {
  serializeUserSummary,
  type SerializedUserSummary,
} from "../../serializers/shared/user-summary.serializer.js";
import { verifyPassword } from "./password.service.js";
import { createAuthToken } from "./token.service.js";
import { createInvalidCredentialsError } from "./auth-errors.js";

type LoginInput = {
  email: string;
  password: string;
};

type LoginEnv = {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
};

export type LoginResult = {
  user: SerializedUserSummary;
  token: string;
};

export async function verifyLoginCredentials(
  prisma: AuthUserRepositoryClient,
  input: LoginInput,
  env: LoginEnv,
): Promise<LoginResult> {
  const user = await findAuthUserByEmail(prisma, input.email);

  if (!user) {
    throw createInvalidCredentialsError();
  }

  const passwordMatches = await verifyPassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches || !user.isActive) {
    throw createInvalidCredentialsError();
  }

  return {
    user: serializeUserSummary(user),
    token: createAuthToken(
      {
        userId: user.id,
        role: user.role,
      },
      env,
    ),
  };
}

export function assertActiveUser(isActive: boolean): void {
  if (!isActive) {
    throw new AuthenticationError();
  }
}
