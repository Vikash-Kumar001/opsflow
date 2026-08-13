import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeTeamRequestResponse } from "../../../serializers/manager/requests/team-request-response.serializer.js";
import { getTeamRequestById } from "../../../services/manager/requests/get-team-request.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { RequestIdParams } from "../../../validators/shared/requests/request.schemas.js";

export const getTeamRequestController: RequestHandler = async (
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
    const request = await getTeamRequestById(prisma, req.user, params.id);

    sendSuccess(res, serializeTeamRequestResponse(request));
  } catch (error) {
    next(error);
  }
};
