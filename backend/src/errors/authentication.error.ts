import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super({
      statusCode: 401,
      code: ErrorCode.UNAUTHORIZED,
      message,
    });
  }
}
