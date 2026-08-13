import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().min(1).default("1h"),
    FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
    CORS_ORIGINS: z.string().optional(),
    JSON_BODY_LIMIT: z.string().min(1).default("1mb"),
    API_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(60_000),
    API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  })
  .superRefine((value, context) => {
    const origins = parseCorsOrigins(value.FRONTEND_ORIGIN, value.CORS_ORIGINS);

    if (value.NODE_ENV === "production" && origins.includes("*")) {
      context.addIssue({
        code: "custom",
        path: ["CORS_ORIGINS"],
        message: "Production CORS origins must not include wildcard origins",
      });
    }
  });

export type Env = z.infer<typeof envSchema> & {
  corsOrigins: string[];
  isProduction: boolean;
};

export function parseCorsOrigins(
  frontendOrigin: string,
  corsOrigins?: string,
): string[] {
  const configuredOrigins = corsOrigins
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : [frontendOrigin];
}

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return {
    ...parsed.data,
    corsOrigins: parseCorsOrigins(
      parsed.data.FRONTEND_ORIGIN,
      parsed.data.CORS_ORIGINS,
    ),
    isProduction: parsed.data.NODE_ENV === "production",
  };
}

export const env = parseEnv(process.env);
