import { describe, expect, it } from "vitest";

import {
  buildPaginationMeta,
  MAX_PAGE_LIMIT,
  parsePagination,
} from "../../../src/utils/pagination.js";

describe("pagination utilities", () => {
  it("defaults invalid input to the first page and default limit", () => {
    expect(parsePagination({ page: "0", limit: "nope" })).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
    });
  });

  it("bounds large limits", () => {
    expect(parsePagination({ page: "3", limit: "1000" })).toEqual({
      page: 3,
      limit: MAX_PAGE_LIMIT,
      skip: 200,
      take: MAX_PAGE_LIMIT,
    });
  });

  it("builds response metadata", () => {
    expect(buildPaginationMeta({ page: 2, limit: 10 }, 25)).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
