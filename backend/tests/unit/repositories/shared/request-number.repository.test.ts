import { describe, expect, it } from "vitest";

import {
  formatRequestNumber,
  generateNextRequestNumber,
  type RequestNumberRepositoryClient,
} from "../../../../src/repositories/shared/request-number.repository.js";

describe("request number repository", () => {
  it("formats request numbers with the public prefix", () => {
    expect(formatRequestNumber(1042n)).toBe("REQ-1042");
  });

  it("returns the atomically reserved counter value", async () => {
    let nextValue = 1001n;

    const prisma: RequestNumberRepositoryClient = {
      requestNumberCounter: {
        async update() {
          nextValue += 1n;

          return {
            nextValue,
          };
        },
      },
    };

    await expect(generateNextRequestNumber(prisma)).resolves.toBe("REQ-1001");
    await expect(generateNextRequestNumber(prisma)).resolves.toBe("REQ-1002");
  });
});
