import type { ApiErrorResponse } from "./api-response.types";

type ApiErrorOptions = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: error.message,
    });
  }

  return new ApiError({
    status: 0,
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  });
}

export function createApiErrorFromResponse(
  status: number,
  response: ApiErrorResponse,
): ApiError {
  return new ApiError({
    status,
    code: response.error.code,
    message: response.error.message,
    details: response.error.details,
    requestId: response.requestId,
  });
}
