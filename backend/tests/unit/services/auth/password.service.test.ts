import { describe, expect, it } from "vitest";

import {
  hashPassword,
  verifyPassword,
} from "../../../../src/services/auth/password.service.js";

describe("password service", () => {
  it("hashes and verifies passwords without storing plaintext", async () => {
    const password = "Admin@123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
