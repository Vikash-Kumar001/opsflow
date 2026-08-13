import type { RequestHandler } from "express";

import { getPrismaClient } from "../../lib/prisma.js";
import { createAuthAuditLog } from "../../repositories/shared/audit-log.repository.js";
import type { AuthUserPasswordRepositoryClient } from "../../repositories/shared/auth-user.repository.js";
import { changeCurrentUserPassword } from "../../services/auth/change-password.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import type { ChangePasswordBody } from "../../validators/auth/change-password.schema.js";

export const changePasswordController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const prisma = await getPrismaClient();
    const user = await changeCurrentUserPassword(
      prisma as typeof prisma & AuthUserPasswordRepositoryClient,
      req.user!.id,
      req.body as ChangePasswordBody,
    );

    await createAuthAuditLog(prisma, {
      actorId: user.id,
      action: "PASSWORD_CHANGED",
      email: user.email,
      role: user.role,
      correlationId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};
