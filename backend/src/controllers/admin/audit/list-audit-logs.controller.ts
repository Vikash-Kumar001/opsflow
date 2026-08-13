import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminAuditRepositoryClient } from "../../../repositories/admin/audit/admin-audit.repository.js";
import { serializeAuditLogListResponse } from "../../../serializers/admin/audit/admin-audit.serializer.js";
import { listAuditLogEvents } from "../../../services/admin/audit/list-audit-logs.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { ListAuditLogsQuery } from "../../../validators/admin/audit/admin-audit.schemas.js";

export const listAuditLogsController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminAuditRepositoryClient;
    const result = await listAuditLogEvents(
      prisma,
      req.validatedQuery as ListAuditLogsQuery,
    );

    sendSuccess(
      res,
      serializeAuditLogListResponse(result.auditLogs, result.pagination),
    );
  } catch (error) {
    next(error);
  }
};
