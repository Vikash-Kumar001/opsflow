import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super({
      statusCode: 409,
      code: ErrorCode.CONFLICT,
      message,
    });
  }
}
