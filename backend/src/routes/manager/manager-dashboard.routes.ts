import { Router } from "express";

import { getManagerDashboardController } from "../../controllers/manager/dashboard/get-manager-dashboard.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";

export const managerDashboardRouter = Router();

managerDashboardRouter.use(
  authenticate,
  requireActiveUser,
  requireRole("MANAGER"),
);

managerDashboardRouter.get(
  "/",
  authorize(PERMISSIONS.ANALYTICS_TEAM),
  getManagerDashboardController,
);
