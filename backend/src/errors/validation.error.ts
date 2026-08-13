import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super({
      statusCode: 400,
      code: ErrorCode.VALIDATION_FAILED,
      message,
      details,
    });
  }
}
