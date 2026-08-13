import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeTeamRequestResponse } from "../../../serializers/manager/requests/team-request-response.serializer.js";
import { rejectTeamRequest } from "../../../services/manager/approvals/reject-request.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { RejectRequestBody } from "../../../validators/manager/approvals/approval.schemas.js";
import type { RequestIdParams } from "../../../validators/shared/requests/request.schemas.js";

export const rejectRequestController: RequestHandler = async (
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
    const request = await rejectTeamRequest(
      prisma,
      req.user,
      params.id,
      req.body as RejectRequestBody,
    );

    sendSuccess(res, serializeTeamRequestResponse(request));
  } catch (error) {
    next(error);
  }
};
