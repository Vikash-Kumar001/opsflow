import { ErrorCode } from "./error-codes.js";

type AppErrorOptions = {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  expose?: boolean;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.expose = options.expose ?? options.statusCode < 500;
  }
}
