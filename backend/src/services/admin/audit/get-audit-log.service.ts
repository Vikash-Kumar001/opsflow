import { NotFoundError } from "../../../errors/not-found.error.js";
import type { AdminAuditRepositoryClient } from "../../../repositories/admin/audit/admin-audit.repository.js";
import {
  findAuditLogById,
  type AuditLogRecord,
} from "../../../repositories/admin/audit/admin-audit.repository.js";

export async function getAuditLogById(
  prisma: AdminAuditRepositoryClient,
  id: string,
): Promise<AuditLogRecord> {
  const auditLog = await findAuditLogById(prisma, id);

  if (!auditLog) {
    throw new NotFoundError("Audit log not found");
  }

  return auditLog;
}
