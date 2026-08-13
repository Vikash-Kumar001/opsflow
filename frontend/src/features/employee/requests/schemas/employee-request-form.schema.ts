import { z } from "zod";

import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
} from "@/features/shared/requests";

export const employeeRequestFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(160, "Title must be 160 characters or fewer"),
  category: z.enum(REQUEST_CATEGORIES, {
    required_error: "Category is required",
  }),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be 5000 characters or fewer"),
  priority: z.enum(REQUEST_PRIORITIES, {
    required_error: "Priority is required",
  }),
});

export type EmployeeRequestFormValues = z.infer<
  typeof employeeRequestFormSchema
>;
