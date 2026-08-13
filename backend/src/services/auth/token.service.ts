import type { CookieOptions } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import type { Env } from "../../config/env.js";
import { AuthenticationError } from "../../errors/authentication.error.js";
import type { UserRole } from "../../domain/user/user.types.js";

export const AUTH_COOKIE_NAME = "opsflow_session";
export const JWT_ISSUER = "opsflow-api";

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
};

export type CreateAuthTokenInput = {
  userId: string;
  role: UserRole;
};

export function parseJwtExpiresInSeconds(expiresIn: string): number {
  const match = expiresIn.trim().match(/^(\d+)([smhd])?$/i);

  if (!match) {
    throw new Error("JWT_EXPIRES_IN must use seconds, minutes, hours, or days");
  }

  const value = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "s";
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  const multiplier = multipliers[unit];

  if (!multiplier) {
    throw new Error("JWT_EXPIRES_IN must use seconds, minutes, hours, or days");
  }

  return value * multiplier;
}

export function createAuthToken(
  input: CreateAuthTokenInput,
  env: Pick<Env, "JWT_SECRET" | "JWT_EXPIRES_IN">,
): string {
  return jwt.sign(
    {
      role: input.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: parseJwtExpiresInSeconds(env.JWT_EXPIRES_IN),
      issuer: JWT_ISSUER,
      subject: input.userId,
    },
  );
}

export function verifyAuthToken(
  token: string,
  env: Pick<Env, "JWT_SECRET">,
): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as JwtPayload;

    if (typeof decoded.sub !== "string" || !isUserRole(decoded["role"])) {
      throw new AuthenticationError();
    }

    return {
      sub: decoded.sub,
      role: decoded["role"],
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    throw new AuthenticationError();
  }
}

export function getAuthCookieOptions(
  env: Pick<Env, "isProduction" | "JWT_EXPIRES_IN">,
): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: parseJwtExpiresInSeconds(env.JWT_EXPIRES_IN) * 1000,
    path: "/",
  };
}

export function getClearAuthCookieOptions(
  env: Pick<Env, "isProduction">,
): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
  };
}

function isUserRole(value: unknown): value is UserRole {
  return value === "ADMIN" || value === "MANAGER" || value === "EMPLOYEE";
}
