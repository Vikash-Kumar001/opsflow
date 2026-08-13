import { z } from "zod";

import { USER_ROLES } from "../../../domain/user/user.types.js";

const paginationNumberSchema = z.coerce.number().int().positive().max(100);
const queryBooleanSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) =>
    typeof value === "boolean" ? value : value === "true",
  );

export const listAdminUsersQuerySchema = z.strictObject({
  page: paginationNumberSchema.optional(),
  limit: paginationNumberSchema.optional(),
  search: z.string().trim().min(1).max(120).optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: queryBooleanSchema.optional(),
});

export const adminUserIdParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export const createAdminUserBodySchema = z.strictObject({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(USER_ROLES),
  isActive: z.boolean().optional(),
  managerId: z.string().uuid().nullable().optional(),
});

export const changeAdminUserRoleBodySchema = z.strictObject({
  role: z.enum(USER_ROLES),
});

export const changeAdminUserStatusBodySchema = z.strictObject({
  isActive: z.boolean(),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;
export type AdminUserIdParams = z.infer<typeof adminUserIdParamsSchema>;
export type CreateAdminUserBody = z.infer<typeof createAdminUserBodySchema>;
export type ChangeAdminUserRoleBody = z.infer<
  typeof changeAdminUserRoleBodySchema
>;
export type ChangeAdminUserStatusBody = z.infer<
  typeof changeAdminUserStatusBodySchema
>;
