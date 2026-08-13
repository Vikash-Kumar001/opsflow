import {
  createAuthAuditLog,
  type AuditLogRepositoryClient,
  type AuthAuditInput,
} from "../../repositories/shared/audit-log.repository.js";
import { logger } from "../../utils/logger.js";

export async function tryCreateAuthAuditLog(
  prisma: AuditLogRepositoryClient,
  input: AuthAuditInput,
): Promise<void> {
  try {
    await createAuthAuditLog(prisma, input);
  } catch (error) {
    logger.error("Failed to create auth audit log", {
      action: input.action,
      correlationId: input.correlationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
