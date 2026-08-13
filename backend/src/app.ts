import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { adminAuditRouter } from "./routes/admin/admin-audit.routes.js";
import { adminDashboardRouter } from "./routes/admin/admin-dashboard.routes.js";
import { adminRequestRouter } from "./routes/admin/admin-request.routes.js";
import { adminUserRouter } from "./routes/admin/admin-user.routes.js";
import { authRouter } from "./routes/auth/auth.routes.js";
import { employeeDashboardRouter } from "./routes/employee/employee-dashboard.routes.js";
import { managerDashboardRouter } from "./routes/manager/manager-dashboard.routes.js";
import { managerRequestRouter } from "./routes/manager/manager-request.routes.js";
import { healthRouter } from "./routes/shared/health.routes.js";
import { requestRouter } from "./routes/shared/request.routes.js";
import { rootRouter } from "./routes/shared/root.routes.js";
import { logger } from "./utils/logger.js";

export const app = express();

app.disable("x-powered-by");

app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(cookieParser());
app.use(compression());
app.use(
  morgan("combined", {
    stream: {
      write(message) {
        logger.info(message.trim());
      },
    },
  }),
);
app.use(
  "/api/v1",
  rateLimit({
    windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    limit: env.API_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use("/", rootRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/admin/audit-logs", adminAuditRouter);
app.use("/api/v1/admin/dashboard", adminDashboardRouter);
app.use("/api/v1/admin/requests", adminRequestRouter);
app.use("/api/v1/admin/users", adminUserRouter);
app.use("/api/v1/employee/dashboard", employeeDashboardRouter);
app.use("/api/v1/manager/dashboard", managerDashboardRouter);
app.use("/api/v1/manager/requests", managerRequestRouter);
app.use("/api/v1/health", healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);
