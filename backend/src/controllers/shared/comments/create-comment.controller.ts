import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeCommentResponse } from "../../../serializers/shared/comments/comment-response.serializer.js";
import { createRequestComment } from "../../../services/shared/comments/create-comment.service.js";
import type {
  CreateCommentBody,
  RequestIdParams,
} from "../../../validators/shared/requests/request.schemas.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const createCommentController: RequestHandler = async (
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
    const comment = await createRequestComment(
      prisma,
      req.user,
      params.id,
      req.body as CreateCommentBody,
    );

    sendSuccess(res, serializeCommentResponse(comment), 201);
  } catch (error) {
    next(error);
  }
};
