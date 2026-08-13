import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeTeamRequestResponse } from "../../../serializers/manager/requests/team-request-response.serializer.js";
import { approveTeamRequest } from "../../../services/manager/approvals/approve-request.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { ApproveRequestBody } from "../../../validators/manager/approvals/approval.schemas.js";
import type { RequestIdParams } from "../../../validators/shared/requests/request.schemas.js";

export const approveRequestController: RequestHandler = async (
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
    const request = await approveTeamRequest(
      prisma,
      req.user,
      params.id,
      req.body as ApproveRequestBody,
    );

    sendSuccess(res, serializeTeamRequestResponse(request));
  } catch (error) {
    next(error);
  }
};
