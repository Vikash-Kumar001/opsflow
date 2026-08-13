import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminRequestRepositoryClient } from "../../../repositories/admin/requests/admin-request.repository.js";
import { serializeRequestListResponse } from "../../../serializers/shared/requests/request-response.serializer.js";
import { listAllRequests } from "../../../services/admin/requests/list-all-requests.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { ListRequestsQuery } from "../../../validators/shared/requests/request.schemas.js";

export const listAllRequestsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminRequestRepositoryClient;
    const result = await listAllRequests(
      prisma,
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
