import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client.js";
import { seedAuditLogs } from "./audit.seed.js";
import { seedComments } from "./comments.seed.js";
import { seedRequests } from "./requests.seed.js";
import { seedUsers } from "./users.seed.js";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed command.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const users = await seedUsers(prisma);
  const requests = await seedRequests(prisma, users);
  const comments = await seedComments(prisma, users, requests);
  const auditLogs = await seedAuditLogs(prisma, users, requests, comments);

  await prisma.requestNumberCounter.upsert({
    where: { id: "request" },
    create: {
      id: "request",
      nextValue: 1031n,
    },
    update: {
      nextValue: 1031n,
    },
  });

  console.info(
    `Seeded demo data: ${Object.keys(users).length} users, ${requests.length} requests, ${comments.length} comments, ${auditLogs.length} audit logs.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
