import { env } from "./config/env.js";
import { disconnectPrisma } from "./lib/prisma.js";
import { app } from "./app.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info(`OpsFlow API listening on port ${env.PORT}`);
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info(`Received ${signal}, shutting down`);

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
