import type { CookieOptions } from "express";

import type { Env } from "../../config/env.js";
import {
  AUTH_COOKIE_NAME,
  getClearAuthCookieOptions,
} from "./token.service.js";

export type LogoutSessionResult = {
  cookieName: string;
  cookieOptions: CookieOptions;
};

export function createLogoutSession(
  env: Pick<Env, "isProduction">,
): LogoutSessionResult {
  return {
    cookieName: AUTH_COOKIE_NAME,
    cookieOptions: getClearAuthCookieOptions(env),
  };
}
