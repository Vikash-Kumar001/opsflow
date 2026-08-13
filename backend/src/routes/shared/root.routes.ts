import { Router } from "express";

import { sendSuccess } from "../../utils/api-response.js";

export const rootRouter = Router();

rootRouter.get("/", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    service: "opsflow-api",
    health: "/api/v1/health",
    apiBase: "/api/v1",
  });
});
