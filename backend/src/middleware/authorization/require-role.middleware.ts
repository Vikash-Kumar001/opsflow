import type { RequestHandler } from "express";

import type { UserRole } from "../../domain/user/user.types.js";
import { AuthenticationError } from "../../errors/authentication.error.js";
import { AuthorizationError } from "../../errors/authorization.error.js";

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
}
