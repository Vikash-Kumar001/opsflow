import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeRequestResponse } from "../../../serializers/shared/requests/request-response.serializer.js";
import { updateOwnedRequest } from "../../../services/shared/requests/update-request.service.js";
import type {
  RequestIdParams,
  UpdateRequestBody,
} from "../../../validators/shared/requests/request.schemas.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const updateRequestController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = await getPrismaClient();
    const params = req.params as RequestIdParams;
    const request = await updateOwnedRequest(
      prisma,
      req.user,
      params.id,
      req.body as UpdateRequestBody,
    );

    sendSuccess(res, serializeRequestResponse(request));
  } catch (error) {
    next(error);
  }
};
