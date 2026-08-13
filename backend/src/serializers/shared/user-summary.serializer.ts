import type { UserRole } from "../../domain/user/user.types.js";

export const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  managerId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type UserSummaryRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedUserSummary = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeUserSummary(
  user: UserSummaryRecord,
): SerializedUserSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    managerId: user.managerId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
