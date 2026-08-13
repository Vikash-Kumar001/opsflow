import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import { serializeManagerDashboard } from "../../../serializers/manager/dashboard/manager-dashboard.serializer.js";
import { getManagerDashboard } from "../../../services/manager/dashboard/get-manager-dashboard.service.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const getManagerDashboardController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma = await getPrismaClient();
    const dashboard = await getManagerDashboard(prisma, req.user);

    sendSuccess(res, serializeManagerDashboard(dashboard));
  } catch (error) {
    next(error);
  }
};
