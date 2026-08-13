import { Router } from "express";

import { createRequestController } from "../../controllers/shared/requests/create-request.controller.js";
import { cancelRequestController } from "../../controllers/shared/requests/cancel-request.controller.js";
import { deleteRequestController } from "../../controllers/admin/requests/delete-request.controller.js";
import { createCommentController } from "../../controllers/shared/comments/create-comment.controller.js";
import { getRequestController } from "../../controllers/shared/requests/get-request.controller.js";
import { listRequestsController } from "../../controllers/shared/requests/list-requests.controller.js";
import { listCommentsController } from "../../controllers/shared/comments/list-comments.controller.js";
import { submitRequestController } from "../../controllers/shared/requests/submit-request.controller.js";
import { updateRequestController } from "../../controllers/shared/requests/update-request.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";
import {
  createRequestBodySchema,
  createCommentBodySchema,
  listRequestsQuerySchema,
  requestIdParamsSchema,
  updateRequestBodySchema,
} from "../../validators/shared/requests/request.schemas.js";

export const requestRouter = Router();

requestRouter.use(authenticate, requireActiveUser);

requestRouter.post(
  "/",
  authorize(PERMISSIONS.REQUEST_CREATE),
  validate({ body: createRequestBodySchema }),
  createRequestController,
);

requestRouter.get(
  "/",
  authorize(PERMISSIONS.REQUEST_READ_OWN),
  validate({ query: listRequestsQuerySchema }),
  listRequestsController,
);

requestRouter.get(
  "/:id/comments",
  authorize(PERMISSIONS.REQUEST_READ_OWN),
  validate({ params: requestIdParamsSchema }),
  listCommentsController,
);

requestRouter.post(
  "/:id/comments",
  authorize(PERMISSIONS.COMMENT_CREATE),
  validate({ params: requestIdParamsSchema, body: createCommentBodySchema }),
  createCommentController,
);

requestRouter.patch(
  "/:id/submit",
  authorize(PERMISSIONS.REQUEST_SUBMIT),
  validate({ params: requestIdParamsSchema }),
  submitRequestController,
);

requestRouter.patch(
  "/:id/cancel",
  authorize(PERMISSIONS.REQUEST_CANCEL),
  validate({ params: requestIdParamsSchema }),
  cancelRequestController,
);

requestRouter.patch(
  "/:id",
  authorize(PERMISSIONS.REQUEST_UPDATE_OWN),
  validate({ params: requestIdParamsSchema, body: updateRequestBodySchema }),
  updateRequestController,
);

requestRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  authorize(PERMISSIONS.REQUEST_DELETE),
  validate({ params: requestIdParamsSchema }),
  deleteRequestController,
);

requestRouter.get(
  "/:id",
  authorize(PERMISSIONS.REQUEST_READ_OWN),
  validate({ params: requestIdParamsSchema }),
  getRequestController,
);
