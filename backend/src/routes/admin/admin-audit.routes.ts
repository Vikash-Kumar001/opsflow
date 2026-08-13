import { Router } from "express";

import { getAuditLogController } from "../../controllers/admin/audit/get-audit-log.controller.js";
import { listAuditLogsController } from "../../controllers/admin/audit/list-audit-logs.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";
import {
  auditLogIdParamsSchema,
  listAuditLogsQuerySchema,
} from "../../validators/admin/audit/admin-audit.schemas.js";

export const adminAuditRouter = Router();

adminAuditRouter.use(authenticate, requireActiveUser, requireRole("ADMIN"));

adminAuditRouter.get(
  "/",
  authorize(PERMISSIONS.AUDIT_READ),
  validate({ query: listAuditLogsQuerySchema }),
  listAuditLogsController,
);

adminAuditRouter.get(
  "/:id",
  authorize(PERMISSIONS.AUDIT_READ),
  validate({ params: auditLogIdParamsSchema }),
  getAuditLogController,
);
