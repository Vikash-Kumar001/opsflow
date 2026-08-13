import { z } from "zod";

export const requestCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(2000, "Comment must be 2000 characters or fewer"),
});

export type RequestCommentValues = z.infer<typeof requestCommentSchema>;
