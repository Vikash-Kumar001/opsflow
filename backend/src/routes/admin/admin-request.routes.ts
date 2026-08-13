import { Router } from "express";

import { getAdminRequestController } from "../../controllers/admin/requests/get-request.controller.js";
import { listAllRequestsController } from "../../controllers/admin/requests/list-all-requests.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";
import {
  listRequestsQuerySchema,
  requestIdParamsSchema,
} from "../../validators/shared/requests/request.schemas.js";

export const adminRequestRouter = Router();

adminRequestRouter.use(authenticate, requireActiveUser, requireRole("ADMIN"));

adminRequestRouter.get(
  "/",
  authorize(PERMISSIONS.REQUEST_READ_ALL),
  validate({ query: listRequestsQuerySchema }),
  listAllRequestsController,
);

adminRequestRouter.get(
  "/:id",
  authorize(PERMISSIONS.REQUEST_READ_ALL),
  validate({ params: requestIdParamsSchema }),
  getAdminRequestController,
);
