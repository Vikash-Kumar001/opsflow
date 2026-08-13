import type { Role } from "@/features/auth/types/auth.types";

export const ADMIN_USER_ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;
export const ADMIN_USER_STATUSES = ["active", "inactive"] as const;

export type AdminUserRole = Role;
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserListParams = {
  page: number;
  limit: number;
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
};

export type AdminUserListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminUserListData = {
  users: AdminUser[];
  pagination: AdminUserListPagination;
};

export type AdminUserData = {
  user: AdminUser;
};

export type CreateAdminUserPayload = {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
  isActive?: boolean;
};

export type ChangeAdminUserRolePayload = {
  id: string;
  role: AdminUserRole;
};

export type ChangeAdminUserStatusPayload = {
  id: string;
  isActive: boolean;
};
