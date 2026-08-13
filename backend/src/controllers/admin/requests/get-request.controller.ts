import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminRequestRepositoryClient } from "../../../repositories/admin/requests/admin-request.repository.js";
import { serializeRequestResponse } from "../../../serializers/shared/requests/request-response.serializer.js";
import { getAdminRequestById } from "../../../services/admin/requests/get-request.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { RequestIdParams } from "../../../validators/shared/requests/request.schemas.js";

export const getAdminRequestController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminRequestRepositoryClient;
    const params = req.params as RequestIdParams;
    const request = await getAdminRequestById(prisma, params.id);

    sendSuccess(res, serializeRequestResponse(request));
  } catch (error) {
    next(error);
  }
};
