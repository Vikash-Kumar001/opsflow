import type { RequestHandler } from "express";

import { AuthenticationError } from "../../../errors/authentication.error.js";
import { getPrismaClient } from "../../../lib/prisma.js";
import type { EmployeeDashboardRepositoryClient } from "../../../repositories/employee/dashboard/employee-dashboard.repository.js";
import { serializeEmployeeDashboard } from "../../../serializers/employee/dashboard/employee-dashboard.serializer.js";
import { getEmployeeDashboard } from "../../../services/employee/dashboard/get-employee-dashboard.service.js";
import { sendSuccess } from "../../../utils/api-response.js";

export const getEmployeeDashboardController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const prisma =
      (await getPrismaClient()) as unknown as EmployeeDashboardRepositoryClient;
    const dashboard = await getEmployeeDashboard(prisma, req.user);

    sendSuccess(res, serializeEmployeeDashboard(dashboard));
  } catch (error) {
    next(error);
  }
};
