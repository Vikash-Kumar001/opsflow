import { z } from "zod";

const optionalTrimmedText = z
  .string()
  .trim()
  .max(2000, "Notes must be 2000 characters or fewer")
  .optional()
  .transform((value) => (value ? value : undefined));

export const managerReviewNotesSchema = z.object({
  reviewNotes: optionalTrimmedText,
});

export const managerRejectRequestSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(2000, "Rejection reason must be 2000 characters or fewer"),
  reviewNotes: optionalTrimmedText,
});

export type ManagerReviewNotesValues = z.infer<
  typeof managerReviewNotesSchema
>;
export type ManagerRejectRequestValues = z.infer<
  typeof managerRejectRequestSchema
>;
