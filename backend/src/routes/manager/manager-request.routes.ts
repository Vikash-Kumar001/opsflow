import { Router } from "express";

import { approveRequestController } from "../../controllers/manager/approvals/approve-request.controller.js";
import { rejectRequestController } from "../../controllers/manager/approvals/reject-request.controller.js";
import { startReviewController } from "../../controllers/manager/approvals/start-review.controller.js";
import { getTeamRequestController } from "../../controllers/manager/requests/get-team-request.controller.js";
import { listTeamRequestsController } from "../../controllers/manager/requests/list-team-requests.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";
import {
  approveRequestBodySchema,
  rejectRequestBodySchema,
  startReviewBodySchema,
} from "../../validators/manager/approvals/approval.schemas.js";
import {
  listRequestsQuerySchema,
  requestIdParamsSchema,
} from "../../validators/shared/requests/request.schemas.js";

export const managerRequestRouter = Router();

managerRequestRouter.use(
  authenticate,
  requireActiveUser,
  requireRole("MANAGER"),
);

managerRequestRouter.get(
  "/",
  authorize(PERMISSIONS.REQUEST_READ_TEAM),
  validate({ query: listRequestsQuerySchema }),
  listTeamRequestsController,
);

managerRequestRouter.patch(
  "/:id/start-review",
  authorize(PERMISSIONS.REQUEST_APPROVE),
  validate({ params: requestIdParamsSchema, body: startReviewBodySchema }),
  startReviewController,
);

managerRequestRouter.patch(
  "/:id/approve",
  authorize(PERMISSIONS.REQUEST_APPROVE),
  validate({ params: requestIdParamsSchema, body: approveRequestBodySchema }),
  approveRequestController,
);

managerRequestRouter.patch(
  "/:id/reject",
  authorize(PERMISSIONS.REQUEST_REJECT),
  validate({ params: requestIdParamsSchema, body: rejectRequestBodySchema }),
  rejectRequestController,
);

managerRequestRouter.get(
  "/:id",
  authorize(PERMISSIONS.REQUEST_READ_TEAM),
  validate({ params: requestIdParamsSchema }),
  getTeamRequestController,
);
