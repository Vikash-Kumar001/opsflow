import rateLimit from "express-rate-limit";

import { env } from "../../config/env.js";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: () => env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
});
