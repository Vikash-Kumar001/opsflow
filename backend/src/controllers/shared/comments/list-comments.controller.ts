import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeCommentListResponse } from "../../../serializers/shared/comments/comment-response.serializer.js";
import { listRequestComments } from "../../../services/shared/comments/list-comments.service.js";
import type { RequestIdParams } from "../../../validators/shared/requests/request.schemas.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const listCommentsController: RequestHandler = async (
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
    const comments = await listRequestComments(prisma, req.user, params.id);

    sendSuccess(res, serializeCommentListResponse(comments));
  } catch (error) {
    next(error);
  }
};
