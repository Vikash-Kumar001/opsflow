import type { RequestHandler } from "express";

import { env } from "../../config/env.js";
import { getPrismaClient } from "../../lib/prisma.js";
import { createAuthAuditLog } from "../../repositories/shared/audit-log.repository.js";
import { createLogoutSession } from "../../services/auth/logout.service.js";
import { sendSuccess } from "../../utils/api-response.js";

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const prisma = await getPrismaClient();

    if (req.user) {
      await createAuthAuditLog(prisma, {
        actorId: req.user.id,
        action: "LOGOUT",
        email: req.user.email,
        role: req.user.role,
        correlationId: req.requestId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    }

    const session = createLogoutSession(env);

    res.clearCookie(session.cookieName, session.cookieOptions);
    sendSuccess(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
};
