import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "../config/env.js";
import type { ManagerRequestRepositoryClient } from "../repositories/manager/requests/manager-request.repository.js";
import type { AuditLogRepositoryClient } from "../repositories/shared/audit-log.repository.js";
import type { AuthUserRepositoryClient } from "../repositories/shared/auth-user.repository.js";
import type { CommentRepositoryClient } from "../repositories/shared/comments/comment.repository.js";
import type { RequestNumberRepositoryClient } from "../repositories/shared/request-number.repository.js";
import type { RequestRepositoryClient } from "../repositories/shared/requests/request.repository.js";

type PrismaClientConstructor = new (options?: unknown) => PrismaClientLike;

export type PrismaClientLike = AuthUserRepositoryClient &
  AuditLogRepositoryClient & {
    $transaction<T>(
      callback: (transaction: PrismaClientLike) => Promise<T>,
    ): Promise<T>;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  } & RequestNumberRepositoryClient &
  RequestRepositoryClient &
  ManagerRequestRepositoryClient &
  CommentRepositoryClient;

let prisma: PrismaClientLike | undefined;

export async function getPrismaClient(): Promise<PrismaClientLike> {
  if (!prisma) {
    const clientModulePath = "../../generated/prisma/client.js";
    const generatedClient = (await import(clientModulePath)) as unknown as {
      PrismaClient: PrismaClientConstructor;
    };

    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

    prisma = new generatedClient.PrismaClient({ adapter });
  }

  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
}

export function setPrismaClientForTesting(client: PrismaClientLike): void {
  if (env.NODE_ENV !== "test") {
    throw new Error("Prisma test override is only available in test mode.");
  }

  prisma = client;
}
