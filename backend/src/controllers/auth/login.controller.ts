import type { RequestHandler } from "express";

import { env } from "../../config/env.js";
import { getPrismaClient } from "../../lib/prisma.js";
import { normalizeEmail } from "../../repositories/shared/auth-user.repository.js";
import { tryCreateAuthAuditLog } from "../../services/auth/auth-audit.service.js";
import { verifyLoginCredentials } from "../../services/auth/login.service.js";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from "../../services/auth/token.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import type { LoginBody } from "../../validators/auth/login.schema.js";

export const loginController: RequestHandler = async (req, res, next) => {
  const body = req.body as LoginBody;
  const prisma = await getPrismaClient();
  const email = normalizeEmail(body.email);

  try {
    const result = await verifyLoginCredentials(prisma, body, env);

    await tryCreateAuthAuditLog(prisma, {
      actorId: result.user.id,
      action: "LOGIN_SUCCESS",
      email: result.user.email,
      role: result.user.role,
      correlationId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions(env));
    sendSuccess(res, { user: result.user });
  } catch (error) {
    await tryCreateAuthAuditLog(prisma, {
      action: "LOGIN_FAILED",
      email,
      correlationId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    next(error);
  }
};
