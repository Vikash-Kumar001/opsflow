import type { UserRole } from "../../../domain/user/user.types.js";
import {
  userSummarySelect,
  type UserSummaryRecord,
} from "../../../serializers/shared/user-summary.serializer.js";

export type AdminUserListFilters = {
  search?: string | undefined;
  role?: UserRole | undefined;
  isActive?: boolean | undefined;
  skip: number;
  take: number;
};

type AdminUserWhereInput = {
  id?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  OR?: Array<{
    name?: { contains: string; mode: "insensitive" };
    email?: { contains: string; mode: "insensitive" };
  }>;
};

type AdminUserCreateInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  managerId?: string | null | undefined;
};

type AdminUserUpdateInput = {
  role?: UserRole;
  isActive?: boolean;
};

type AdminUserDelegate = {
  findMany(args: {
    where: AdminUserWhereInput;
    orderBy: { createdAt: "desc" };
    skip: number;
    take: number;
    select: typeof userSummarySelect;
  }): Promise<UserSummaryRecord[]>;
  count(args: { where: AdminUserWhereInput }): Promise<number>;
  findUnique(args: {
    where: { id: string } | { email: string };
    select: typeof userSummarySelect;
  }): Promise<UserSummaryRecord | null>;
  create(args: {
    data: AdminUserCreateInput;
    select: typeof userSummarySelect;
  }): Promise<UserSummaryRecord>;
  update(args: {
    where: { id: string };
    data: AdminUserUpdateInput;
    select: typeof userSummarySelect;
  }): Promise<UserSummaryRecord>;
};

export type AdminUserRepositoryClient = {
  user: AdminUserDelegate;
};

export async function listAdminUsers(
  prisma: AdminUserRepositoryClient,
  filters: AdminUserListFilters,
): Promise<{ users: UserSummaryRecord[]; total: number }> {
  const where = buildAdminUserWhere(filters);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip,
      take: filters.take,
      select: userSummarySelect,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

export async function findAdminUserById(
  prisma: AdminUserRepositoryClient,
  id: string,
): Promise<UserSummaryRecord | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSummarySelect,
  });
}

export async function findAdminUserByEmail(
  prisma: AdminUserRepositoryClient,
  email: string,
): Promise<UserSummaryRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: userSummarySelect,
  });
}

export async function createAdminUserRecord(
  prisma: AdminUserRepositoryClient,
  input: AdminUserCreateInput,
): Promise<UserSummaryRecord> {
  const data: AdminUserCreateInput = {
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    role: input.role,
    isActive: input.isActive,
  };

  if (input.managerId !== undefined) {
    data.managerId = input.managerId;
  }

  return prisma.user.create({
    data,
    select: userSummarySelect,
  });
}

export async function updateAdminUserRecord(
  prisma: AdminUserRepositoryClient,
  id: string,
  data: AdminUserUpdateInput,
): Promise<UserSummaryRecord> {
  return prisma.user.update({
    where: { id },
    data,
    select: userSummarySelect,
  });
}

export async function countActiveAdmins(
  prisma: AdminUserRepositoryClient,
): Promise<number> {
  return prisma.user.count({
    where: {
      role: "ADMIN",
      isActive: true,
    },
  });
}

function buildAdminUserWhere(
  filters: Partial<AdminUserListFilters>,
): AdminUserWhereInput {
  const where: AdminUserWhereInput = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}
