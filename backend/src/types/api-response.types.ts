import { ErrorCode } from "../errors/error-codes.js";

export type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  requestId?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  requestId?: string;
};

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
