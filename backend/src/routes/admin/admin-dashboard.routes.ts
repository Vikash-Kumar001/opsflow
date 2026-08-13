import { Router } from "express";

import { getAdminDashboardController } from "../../controllers/admin/dashboard/get-admin-dashboard.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";

export const adminDashboardRouter = Router();

adminDashboardRouter.use(authenticate, requireActiveUser, requireRole("ADMIN"));

adminDashboardRouter.get(
  "/",
  authorize(PERMISSIONS.ANALYTICS_ORGANIZATION),
  getAdminDashboardController,
);
