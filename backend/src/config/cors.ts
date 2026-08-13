import type { CorsOptions } from "cors";

import { AppError } from "../errors/app-error.js";
import { ErrorCode } from "../errors/error-codes.js";
import { env } from "./env.js";

export const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (origin && env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(
      new AppError({
        statusCode: 403,
        code: ErrorCode.FORBIDDEN,
        message: "Origin is not allowed by CORS",
      }),
    );
  },
};
