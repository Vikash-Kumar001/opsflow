import type { RequestHandler } from "express";

import { getPrismaClient } from "../../../lib/prisma.js";
import type { AdminAuditRepositoryClient } from "../../../repositories/admin/audit/admin-audit.repository.js";
import { serializeAuditLogResponse } from "../../../serializers/admin/audit/admin-audit.serializer.js";
import { getAuditLogById } from "../../../services/admin/audit/get-audit-log.service.js";
import { sendSuccess } from "../../../utils/api-response.js";
import type { AuditLogIdParams } from "../../../validators/admin/audit/admin-audit.schemas.js";

export const getAuditLogController: RequestHandler = async (req, res, next) => {
  try {
    const prisma =
      (await getPrismaClient()) as unknown as AdminAuditRepositoryClient;
    const params = req.params as AuditLogIdParams;
    const auditLog = await getAuditLogById(prisma, params.id);

    sendSuccess(res, serializeAuditLogResponse(auditLog));
  } catch (error) {
    next(error);
  }
};
