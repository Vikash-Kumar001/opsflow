import { Router } from "express";

import { loginController } from "../../controllers/auth/login.controller.js";
import { logoutController } from "../../controllers/auth/logout.controller.js";
import { meController } from "../../controllers/auth/me.controller.js";
import { changePasswordController } from "../../controllers/auth/change-password.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.middleware.js";
import { requireActiveUser } from "../../middleware/auth/require-active-user.middleware.js";
import { loginRateLimit } from "../../middleware/security/login-rate-limit.middleware.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { loginBodySchema } from "../../validators/auth/login.schema.js";
import { changePasswordBodySchema } from "../../validators/auth/change-password.schema.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  loginRateLimit,
  validate({ body: loginBodySchema }),
  loginController,
);

authRouter.post("/logout", authenticate, requireActiveUser, logoutController);

authRouter.get("/me", authenticate, requireActiveUser, meController);

authRouter.patch(
  "/password",
  authenticate,
  requireActiveUser,
  validate({ body: changePasswordBodySchema }),
  changePasswordController,
);
