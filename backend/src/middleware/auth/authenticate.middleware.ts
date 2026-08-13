import type { RequestHandler } from "express";

import { env } from "../../config/env.js";
import { AuthenticationError } from "../../errors/authentication.error.js";
import { getPrismaClient } from "../../lib/prisma.js";
import { getCurrentActiveUserFromToken } from "../../services/auth/current-user.service.js";
import { AUTH_COOKIE_NAME } from "../../services/auth/token.service.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (typeof token !== "string") {
      throw new AuthenticationError();
    }

    const prisma = await getPrismaClient();
    req.user = await getCurrentActiveUserFromToken(prisma, token, env);

    next();
  } catch (error) {
    next(error);
  }
};
