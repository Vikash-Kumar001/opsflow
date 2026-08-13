import winston from "winston";

import { env } from "../config/env.js";

const redactedKeyFragments = [
  "authorization",
  "cookie",
  "password",
  "token",
  "jwt",
  "secret",
];

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      shouldRedactKey(key) ? "[REDACTED]" : redact(entry),
    ]),
  );
}

function shouldRedactKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return redactedKeyFragments.some((fragment) =>
    normalizedKey.includes(fragment),
  );
}

export const logger = winston.createLogger({
  level: env.isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const { level, message, timestamp, ...metadata } = info;
      const safeMetadata = redact(metadata);
      const serializedMetadata =
        Object.keys(safeMetadata as Record<string, unknown>).length > 0
          ? ` ${JSON.stringify(safeMetadata)}`
          : "";

      return `${timestamp} ${level}: ${message}${serializedMetadata}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});
