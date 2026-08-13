import { z } from "zod";

import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
} from "../../../domain/request/request.constants.js";

const optionalDateSchema = z
  .string()
  .datetime({ offset: true })
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

const paginationNumberSchema = z.coerce.number().int().positive().max(100);

export const createRequestBodySchema = z.strictObject({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(5000),
  category: z.enum(REQUEST_CATEGORIES),
  priority: z.enum(REQUEST_PRIORITIES).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  submit: z.boolean().optional(),
});

export const updateRequestBodySchema = z
  .strictObject({
    title: z.string().trim().min(3).max(160).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    category: z.enum(REQUEST_CATEGORIES).optional(),
    priority: z.enum(REQUEST_PRIORITIES).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one editable field is required",
  });

export const listRequestsQuerySchema = z
  .strictObject({
    page: paginationNumberSchema.optional(),
    limit: paginationNumberSchema.optional(),
    search: z.string().trim().min(1).max(120).optional(),
    status: z.enum(REQUEST_STATUSES).optional(),
    category: z.enum(REQUEST_CATEGORIES).optional(),
    priority: z.enum(REQUEST_PRIORITIES).optional(),
    createdFrom: optionalDateSchema,
    createdTo: optionalDateSchema,
    sortBy: z
      .enum(["createdAt", "updatedAt", "submittedAt", "priority", "title"])
      .optional(),
    sortDirection: z.enum(["asc", "desc"]).optional(),
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

export const requestIdParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export const createCommentBodySchema = z.strictObject({
  content: z.string().trim().min(1).max(2000),
});

export type CreateRequestBody = z.infer<typeof createRequestBodySchema>;
export type UpdateRequestBody = z.infer<typeof updateRequestBodySchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
export type RequestIdParams = z.infer<typeof requestIdParamsSchema>;
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
