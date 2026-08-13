import { z } from "zod";

import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../repositories/shared/audit-log.repository.js";

const paginationNumberSchema = z.coerce.number().int().positive().max(100);
const optionalDateSchema = z
  .string()
  .datetime({ offset: true })
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

export const listAuditLogsQuerySchema = z
  .strictObject({
    page: paginationNumberSchema.optional(),
    limit: paginationNumberSchema.optional(),
    search: z.string().trim().min(1).max(120).optional(),
    action: z.enum(AUDIT_ACTIONS).optional(),
    actorId: z.string().uuid().optional(),
    entityType: z.enum(AUDIT_ENTITY_TYPES).optional(),
    targetUserId: z.string().uuid().optional(),
    targetRequestId: z.string().uuid().optional(),
    targetCommentId: z.string().uuid().optional(),
    createdFrom: optionalDateSchema,
    createdTo: optionalDateSchema,
  })
  .refine(
    (value) =>
      !value.createdFrom ||
      !value.createdTo ||
      value.createdFrom.getTime() <= value.createdTo.getTime(),
    {
      message: "createdFrom must be before or equal to createdTo",
      path: ["createdFrom"],
    },
  );

export const auditLogIdParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type AuditLogIdParams = z.infer<typeof auditLogIdParamsSchema>;
