import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error.js";
import { ErrorCode } from "../errors/error-codes.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new AppError({
      statusCode: 404,
      code: ErrorCode.NOT_FOUND,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    }),
  );
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const appError = normalizeError(error);

  if (appError.statusCode >= 500) {
    logger.error(appError.message, {
      requestId: req.requestId,
      stack: appError.stack,
    });
  }

  const body = {
    success: false,
    error: {
      code: appError.code,
      message: appError.expose
        ? appError.message
        : "An unexpected error occurred",
    },
  };

  if (appError.details !== undefined) {
    Object.assign(body.error, { details: appError.details });
  }

  if (req.requestId) {
    Object.assign(body, { requestId: req.requestId });
  }

  res.status(appError.statusCode).json(body);
};

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError({
      statusCode: 400,
      code: ErrorCode.VALIDATION_FAILED,
      message: "Validation failed",
      details: error.issues,
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return new AppError({
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      message: "Malformed JSON request body",
    });
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  return new AppError({
    statusCode: 500,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message,
    expose: false,
  });
}
