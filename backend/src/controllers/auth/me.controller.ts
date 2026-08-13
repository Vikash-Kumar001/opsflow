import type { RequestHandler } from "express";

import { AuthenticationError } from "../../errors/authentication.error.js";
import { sendSuccess } from "../../utils/api-response.js";

export const meController: RequestHandler = (req, res, next) => {
  if (!req.user) {
    next(new AuthenticationError());
    return;
  }

  sendSuccess(res, { user: req.user });
};
