import type { PrismaClient } from "../../src/generated/prisma/client.js";

export type SeedPrismaClient = PrismaClient;

export type SeedUsers = Awaited<
  ReturnType<typeof import("./users.seed.js").seedUsers>
>;

export type SeedRequest = {
  id: string;
  requestNumber: string;
  createdById: string;
};

export type SeedComment = {
  id: string;
  requestId: string;
  authorId: string;
};
