import type { RequestHandler } from "express";

import { AuthenticationError } from "../../errors/authentication.error.js";

export const requireActiveUser: RequestHandler = (req, _res, next) => {
  if (!req.user?.isActive) {
    next(new AuthenticationError());
    return;
  }

  next();
};
