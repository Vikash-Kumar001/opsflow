import { Role } from "../../generated/prisma/enums.js";
import { hashPassword } from "../../src/services/auth/password.service.js";
import { userIds } from "./demo-ids.js";
import type { SeedPrismaClient } from "./types.js";

const demoUsers = [
  {
    id: userIds.admin,
    name: "Aisha Admin",
    email: "admin@opsflow.demo",
    password: "Admin@123",
    role: Role.ADMIN,
    managerId: null,
  },
  {
    id: userIds.manager,
    name: "Rahul Manager",
    email: "manager@opsflow.demo",
    password: "Manager@123",
    role: Role.MANAGER,
    managerId: null,
  },
  {
    id: userIds.operationsManager,
    name: "Meera Operations",
    email: "meera.manager@opsflow.demo",
    password: "Manager@123",
    role: Role.MANAGER,
    managerId: null,
  },
  {
    id: userIds.employee,
    name: "Vikash Employee",
    email: "employee@opsflow.demo",
    password: "Employee@123",
    role: Role.EMPLOYEE,
    managerId: userIds.manager,
  },
  {
    id: userIds.priya,
    name: "Priya Sharma",
    email: "priya.employee@opsflow.demo",
    password: "Employee@123",
    role: Role.EMPLOYEE,
    managerId: userIds.manager,
  },
  {
    id: userIds.arjun,
    name: "Arjun Patel",
    email: "arjun.employee@opsflow.demo",
    password: "Employee@123",
    role: Role.EMPLOYEE,
    managerId: userIds.manager,
  },
  {
    id: userIds.neha,
    name: "Neha Gupta",
    email: "neha.employee@opsflow.demo",
    password: "Employee@123",
    role: Role.EMPLOYEE,
    managerId: userIds.operationsManager,
  },
  {
    id: userIds.kabir,
    name: "Kabir Rao",
    email: "kabir.employee@opsflow.demo",
    password: "Employee@123",
    role: Role.EMPLOYEE,
    managerId: userIds.operationsManager,
  },
  {
    id: userIds.ananya,
    name: "Ananya Iyer",
    email: "ananya.employee@opsflow.demo",
    password: "Employee@123",
    role: Role.EMPLOYEE,
    managerId: userIds.operationsManager,
  },
] as const;

export async function seedUsers(prisma: SeedPrismaClient) {
  const users = [];

  for (const user of demoUsers) {
    const passwordHash = await hashPassword(user.password);

    users.push(
      await prisma.user.upsert({
        where: { email: user.email },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role,
          isActive: true,
          managerId: user.managerId,
        },
        update: {
          name: user.name,
          passwordHash,
          role: user.role,
          isActive: true,
          managerId: user.managerId,
        },
      }),
    );
  }

  return {
    admin: users[0],
    manager: users[1],
    operationsManager: users[2],
    employee: users[3],
    priya: users[4],
    arjun: users[5],
    neha: users[6],
    kabir: users[7],
    ananya: users[8],
  };
}
