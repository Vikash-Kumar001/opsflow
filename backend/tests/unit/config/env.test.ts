import { beforeEach, describe, expect, it } from "vitest";

const validEnv = {
  NODE_ENV: "test",
  PORT: "5000",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/opsflow",
  JWT_SECRET: "a-development-secret-that-is-long-enough",
  JWT_EXPIRES_IN: "1d",
  FRONTEND_ORIGIN: "http://localhost:3000",
};

describe("environment parsing", () => {
  beforeEach(() => {
    Object.assign(process.env, validEnv);
  });

  it("normalizes configured values", async () => {
    const { parseEnv } = await import("../../../src/config/env.js");
    const env = parseEnv(validEnv);

    expect(env.PORT).toBe(5000);
    expect(env.corsOrigins).toEqual(["http://localhost:3000"]);
    expect(env.isProduction).toBe(false);
  });

  it("rejects wildcard CORS origins in production", async () => {
    const { parseEnv } = await import("../../../src/config/env.js");

    expect(() =>
      parseEnv({
        ...validEnv,
        NODE_ENV: "production",
        CORS_ORIGINS: "*",
      }),
    ).toThrow("Production CORS origins must not include wildcard origins");
  });

  it("normalizes deployed CORS origin URLs before allowlisting", async () => {
    const { parseEnv } = await import("../../../src/config/env.js");
    const env = parseEnv({
      ...validEnv,
      NODE_ENV: "production",
      FRONTEND_ORIGIN: "https://opsflow-phi.vercel.app/",
      CORS_ORIGINS:
        "https://opsflow-phi.vercel.app/, https://opsflow-5sn8.onrender.com/health",
    });

    expect(env.corsOrigins).toEqual([
      "https://opsflow-phi.vercel.app",
      "https://opsflow-5sn8.onrender.com",
    ]);
  });
});
