import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeRequestListResponse } from "../../../serializers/shared/requests/request-response.serializer.js";
import { listRequests } from "../../../services/shared/requests/list-requests.service.js";
import type { ListRequestsQuery } from "../../../validators/shared/requests/request.schemas.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const listRequestsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = await getPrismaClient();
    const result = await listRequests(
      prisma,
      req.user,
      req.validatedQuery as ListRequestsQuery,
    );

    sendSuccess(
      res,
      serializeRequestListResponse(result.requests, result.pagination),
    );
  } catch (error) {
    next(error);
  }
};
