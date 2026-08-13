import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminUserRepositoryClient } from "../../../repositories/admin/users/admin-user.repository.js";
import { serializeAdminUserListResponse } from "../../../serializers/admin/users/admin-user-response.serializer.js";
import { listUsers } from "../../../services/admin/users/list-users.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { ListAdminUsersQuery } from "../../../validators/admin/users/admin-user.schemas.js";

export const listUsersController: RequestHandler = async (req, res, next) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminUserRepositoryClient;
    const result = await listUsers(
      prisma,
      req.validatedQuery as ListAdminUsersQuery,
    );

    sendSuccess(
      res,
      serializeAdminUserListResponse(result.users, result.pagination),
    );
  } catch (error) {
    next(error);
  }
};
