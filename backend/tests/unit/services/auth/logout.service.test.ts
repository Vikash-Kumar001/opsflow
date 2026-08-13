import { describe, expect, it } from "vitest";

import { createLogoutSession } from "../../../../src/services/auth/logout.service.js";

describe("logout service", () => {
  it("returns the cookie clearing contract", () => {
    expect(createLogoutSession({ isProduction: false })).toEqual({
      cookieName: "opsflow_session",
      cookieOptions: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      },
    });
  });
});
