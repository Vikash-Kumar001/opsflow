import type { Response } from "express";

import type { ApiSuccessResponse } from "../types/api-response.types.js";

export function sendSuccess<TData>(
  res: Response,
  data: TData,
  statusCode = 200,
): void {
  const body: ApiSuccessResponse<TData> = {
    success: true,
    data,
  };

  if (res.req.requestId) {
    body.requestId = res.req.requestId;
  }

  res.status(statusCode).json(body);
}
