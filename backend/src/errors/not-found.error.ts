import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({
      statusCode: 404,
      code: ErrorCode.NOT_FOUND,
      message,
    });
  }
}
