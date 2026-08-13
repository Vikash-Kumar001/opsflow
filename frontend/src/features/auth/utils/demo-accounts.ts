import type { LoginFormValues } from "../schemas/login.schema";
import type { Role } from "../types/auth.types";

export type DemoAccount = LoginFormValues & {
  role: Role;
  label: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    email: "admin@opsflow.demo",
    password: "Admin@123",
  },
  {
    role: "MANAGER",
    label: "Manager",
    email: "manager@opsflow.demo",
    password: "Manager@123",
  },
  {
    role: "EMPLOYEE",
    label: "Employee",
    email: "employee@opsflow.demo",
    password: "Employee@123",
  },
];
