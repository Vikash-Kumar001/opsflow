import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminDashboardRepositoryClient } from "../../../repositories/admin/dashboard/admin-dashboard.repository.js";
import { serializeAdminDashboard } from "../../../serializers/admin/dashboard/admin-dashboard.serializer.js";
import { getAdminDashboard } from "../../../services/admin/dashboard/get-admin-dashboard.service.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const getAdminDashboardController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminDashboardRepositoryClient;
    const dashboard = await getAdminDashboard(prisma);

    sendSuccess(res, serializeAdminDashboard(dashboard));
  } catch (error) {
    next(error);
  }
};
