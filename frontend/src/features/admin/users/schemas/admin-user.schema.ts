import { z } from "zod";

import { ADMIN_USER_ROLES } from "../types/admin-user.types";

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
  role: z.enum(ADMIN_USER_ROLES),
  isActive: z.boolean(),
});

export type CreateAdminUserValues = z.infer<typeof createAdminUserSchema>;
