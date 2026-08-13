import type { RequestHandler } from "express";

import { AuthenticationError } from "../../errors/authentication.error.js";
import { AuthorizationError } from "../../errors/authorization.error.js";
import type { Permission } from "../../permissions/permission.types.js";
import { hasEveryPermission } from "../../permissions/permission.service.js";

export function authorize(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (!hasEveryPermission(req.user.role, permissions)) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
}
