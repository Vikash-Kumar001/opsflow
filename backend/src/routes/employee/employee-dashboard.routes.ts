import { Router } from "express";

import { getEmployeeDashboardController } from "../../controllers/employee/dashboard/get-employee-dashboard.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";

export const employeeDashboardRouter = Router();

employeeDashboardRouter.use(
  authenticate,
  requireActiveUser,
  requireRole("EMPLOYEE"),
);

employeeDashboardRouter.get(
  "/",
  authorize(PERMISSIONS.REQUEST_READ_OWN),
  getEmployeeDashboardController,
);
