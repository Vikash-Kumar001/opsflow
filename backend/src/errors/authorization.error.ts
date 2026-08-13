import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super({
      statusCode: 403,
      code: ErrorCode.FORBIDDEN,
      message,
    });
  }
}
