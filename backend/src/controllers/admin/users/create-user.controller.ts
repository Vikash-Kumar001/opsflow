import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeAdminUserResponse } from "../../../serializers/admin/users/admin-user-response.serializer.js";
import {
  createUser,
  type CreateUserClient,
} from "../../../services/admin/users/create-user.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { CreateAdminUserBody } from "../../../validators/admin/users/admin-user.schemas.js";

export const createUserController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = (await getPrismaClient()) as unknown as CreateUserClient;
    const user = await createUser(
      prisma,
      req.user.id,
      req.body as CreateAdminUserBody,
    );

    sendSuccess(res, serializeAdminUserResponse(user), 201);
  } catch (error) {
    next(error);
  }
};
