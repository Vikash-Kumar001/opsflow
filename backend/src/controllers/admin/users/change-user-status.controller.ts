import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeAdminUserResponse } from "../../../serializers/admin/users/admin-user-response.serializer.js";
import {
  changeUserStatus,
  type ChangeUserStatusClient,
} from "../../../services/admin/users/change-user-status.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type {
  AdminUserIdParams,
  ChangeAdminUserStatusBody,
} from "../../../validators/admin/users/admin-user.schemas.js";

export const changeUserStatusController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma =
      (await getPrismaClient()) as unknown as ChangeUserStatusClient;
    const params = req.params as AdminUserIdParams;
    const body = req.body as ChangeAdminUserStatusBody;
    const user = await changeUserStatus(
      prisma,
      req.user.id,
      params.id,
      body.isActive,
    );

    sendSuccess(res, serializeAdminUserResponse(user));
  } catch (error) {
    next(error);
  }
};
