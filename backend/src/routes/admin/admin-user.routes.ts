import { Router } from "express";

import { changeUserRoleController } from "../../controllers/admin/users/change-user-role.controller.js";
import { changeUserStatusController } from "../../controllers/admin/users/change-user-status.controller.js";
import { createUserController } from "../../controllers/admin/users/create-user.controller.js";
import { getUserController } from "../../controllers/admin/users/get-user.controller.js";
import { listUsersController } from "../../controllers/admin/users/list-users.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { authorize } from "../../middleware/authorization/authorize.middleware.js";
import { requireRole } from "../../middleware/authorization/require-role.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { PERMISSIONS } from "../../permissions/permissions.js";
import {
  adminUserIdParamsSchema,
  changeAdminUserRoleBodySchema,
  changeAdminUserStatusBodySchema,
  createAdminUserBodySchema,
  listAdminUsersQuerySchema,
} from "../../validators/admin/users/admin-user.schemas.js";

export const adminUserRouter = Router();

adminUserRouter.use(authenticate, requireActiveUser, requireRole("ADMIN"));

adminUserRouter.get(
  "/",
  authorize(PERMISSIONS.USER_READ),
  validate({ query: listAdminUsersQuerySchema }),
  listUsersController,
);

adminUserRouter.post(
  "/",
  authorize(PERMISSIONS.USER_MANAGE),
  validate({ body: createAdminUserBodySchema }),
  createUserController,
);

adminUserRouter.patch(
  "/:id/role",
  authorize(PERMISSIONS.USER_ROLE_UPDATE),
  validate({
    params: adminUserIdParamsSchema,
    body: changeAdminUserRoleBodySchema,
  }),
  changeUserRoleController,
);

adminUserRouter.patch(
  "/:id/status",
  authorize(PERMISSIONS.USER_STATUS_UPDATE),
  validate({
    params: adminUserIdParamsSchema,
    body: changeAdminUserStatusBodySchema,
  }),
  changeUserStatusController,
);

adminUserRouter.get(
  "/:id",
  authorize(PERMISSIONS.USER_READ),
  validate({ params: adminUserIdParamsSchema }),
  getUserController,
);
