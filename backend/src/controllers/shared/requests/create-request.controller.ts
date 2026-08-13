import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeRequestResponse } from "../../../serializers/shared/requests/request-response.serializer.js";
import { createRequest } from "../../../services/shared/requests/create-request.service.js";
import type { CreateRequestBody } from "../../../validators/shared/requests/request.schemas.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const createRequestController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = await getPrismaClient();
    const result = await createRequest(
      prisma,
      req.user,
      req.body as CreateRequestBody,
    );

    sendSuccess(res, serializeRequestResponse(result), 201);
  } catch (error) {
    next(error);
  }
};
