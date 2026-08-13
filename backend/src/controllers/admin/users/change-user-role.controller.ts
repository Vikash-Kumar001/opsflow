import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeAdminUserResponse } from "../../../serializers/admin/users/admin-user-response.serializer.js";
import {
  changeUserRole,
  type ChangeUserRoleClient,
} from "../../../services/admin/users/change-user-role.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type {
  AdminUserIdParams,
  ChangeAdminUserRoleBody,
} from "../../../validators/admin/users/admin-user.schemas.js";

export const changeUserRoleController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = (await getPrismaClient()) as unknown as ChangeUserRoleClient;
    const params = req.params as AdminUserIdParams;
    const body = req.body as ChangeAdminUserRoleBody;
    const user = await changeUserRole(
      prisma,
      req.user.id,
      params.id,
      body.role,
    );

    sendSuccess(res, serializeAdminUserResponse(user));
  } catch (error) {
    next(error);
  }
};
