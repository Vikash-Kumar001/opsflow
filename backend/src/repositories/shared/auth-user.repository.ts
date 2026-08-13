import type { UserRole } from "../../domain/user/user.types.js";
import { userSummarySelect } from "../../serializers/shared/user-summary.serializer.js";

export const authUserSelect = {
  ...userSummarySelect,
  passwordHash: true,
} as const;

export type AuthUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserDelegate = {
  findUnique(args: {
    where: { id: string } | { email: string };
    select: typeof authUserSelect;
  }): Promise<AuthUserRecord | null>;
};

export type AuthUserRepositoryClient = {
  user: UserDelegate;
};

export type AuthUserPasswordRepositoryClient = {
  user: UserDelegate & {
    update(args: {
      where: { id: string };
      data: { passwordHash: string };
      select: typeof authUserSelect;
    }): Promise<AuthUserRecord>;
  };
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findAuthUserByEmail(
  prisma: AuthUserRepositoryClient,
  email: string,
): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email),
    },
    select: authUserSelect,
  });
}

export function findAuthUserById(
  prisma: AuthUserRepositoryClient,
  id: string,
): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: authUserSelect,
  });
}

export function updateAuthUserPassword(
  prisma: AuthUserPasswordRepositoryClient,
  id: string,
  passwordHash: string,
): Promise<AuthUserRecord> {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      passwordHash,
    },
    select: authUserSelect,
  });
}
