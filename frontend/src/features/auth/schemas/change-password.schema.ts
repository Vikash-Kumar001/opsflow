import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password must be 128 characters or fewer")
      .regex(/[a-z]/, "New password must include a lowercase letter")
      .regex(/[A-Z]/, "New password must include an uppercase letter")
      .regex(/[0-9]/, "New password must include a number")
      .regex(/[^A-Za-z0-9]/, "New password must include a symbol"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password",
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
