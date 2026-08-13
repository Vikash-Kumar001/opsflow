import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class InvalidTransitionError extends AppError {
  constructor(
    message = "Invalid request status transition",
    details?: unknown,
  ) {
    super({
      statusCode: 409,
      code: ErrorCode.INVALID_TRANSITION,
      message,
      details,
    });
  }
}
