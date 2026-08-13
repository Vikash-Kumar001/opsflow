import { z } from "zod";

const reviewNotesSchema = z.string().trim().min(1).max(2000).optional();

export const startReviewBodySchema = z.strictObject({
  reviewNotes: reviewNotesSchema,
});

export const approveRequestBodySchema = z.strictObject({
  reviewNotes: reviewNotesSchema,
});

export const rejectRequestBodySchema = z.strictObject({
  rejectionReason: z.string().trim().min(1).max(2000),
  reviewNotes: reviewNotesSchema,
});

export type StartReviewBody = z.infer<typeof startReviewBodySchema>;
export type ApproveRequestBody = z.infer<typeof approveRequestBodySchema>;
export type RejectRequestBody = z.infer<typeof rejectRequestBodySchema>;
