import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminUserRepositoryClient } from "../../../repositories/admin/users/admin-user.repository.js";
import { serializeAdminUserResponse } from "../../../serializers/admin/users/admin-user-response.serializer.js";
import { getUserById } from "../../../services/admin/users/get-user.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { AdminUserIdParams } from "../../../validators/admin/users/admin-user.schemas.js";

export const getUserController: RequestHandler = async (req, res, next) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminUserRepositoryClient;
    const params = req.params as AdminUserIdParams;
    const user = await getUserById(prisma, params.id);

    sendSuccess(res, serializeAdminUserResponse(user));
  } catch (error) {
    next(error);
  }
};
