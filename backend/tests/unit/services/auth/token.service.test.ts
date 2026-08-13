import { describe, expect, it } from "vitest";

import { AuthenticationError } from "../../../../src/errors/authentication.error.js";
import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getAuthCookieOptions,
  parseJwtExpiresInSeconds,
  verifyAuthToken,
} from "../../../../src/services/auth/token.service.js";

const tokenEnv = {
  JWT_SECRET: "a-development-secret-that-is-long-enough",
  JWT_EXPIRES_IN: "15m",
};

describe("token service", () => {
  it("parses compact token durations", () => {
    expect(parseJwtExpiresInSeconds("30s")).toBe(30);
    expect(parseJwtExpiresInSeconds("15m")).toBe(900);
    expect(parseJwtExpiresInSeconds("2h")).toBe(7200);
    expect(parseJwtExpiresInSeconds("1d")).toBe(86400);
  });

  it("creates and verifies minimal auth token payloads", () => {
    const token = createAuthToken(
      {
        userId: "user-1",
        role: "MANAGER",
      },
      tokenEnv,
    );

    expect(typeof token).toBe("string");
    expect(verifyAuthToken(token, tokenEnv)).toEqual({
      sub: "user-1",
      role: "MANAGER",
    });
  });

  it("rejects invalid signatures", () => {
    const token = createAuthToken(
      {
        userId: "user-1",
        role: "EMPLOYEE",
      },
      tokenEnv,
    );

    expect(() =>
      verifyAuthToken(token, {
        JWT_SECRET: "a-different-development-secret-that-is-long-enough",
      }),
    ).toThrow(AuthenticationError);
  });

  it("uses secure cookie flags in production", () => {
    const options = getAuthCookieOptions({
      isProduction: true,
      JWT_EXPIRES_IN: "1h",
    });

    expect(AUTH_COOKIE_NAME).toBe("opsflow_session");
    expect(options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 3600000,
    });
  });
});
