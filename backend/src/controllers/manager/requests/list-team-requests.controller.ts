import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeTeamRequestListResponse } from "../../../serializers/manager/requests/team-request-response.serializer.js";
import { listTeamRequests } from "../../../services/manager/requests/list-team-requests.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { ListRequestsQuery } from "../../../validators/shared/requests/request.schemas.js";

export const listTeamRequestsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = await getPrismaClient();
    const result = await listTeamRequests(
      prisma,
      req.user,
      req.validatedQuery as ListRequestsQuery,
    );

    sendSuccess(
      res,
      serializeTeamRequestListResponse(result.requests, result.pagination),
    );
  } catch (error) {
    next(error);
  }
};
