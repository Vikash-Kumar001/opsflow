export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

export type PaginationInput = {
  page?: unknown;
  limit?: unknown;
};

export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value > 0 ? value : undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parsePagination(input: PaginationInput): PaginationParams {
  const page = parsePositiveInteger(input.page) ?? DEFAULT_PAGE;
  const rawLimit = parsePositiveInteger(input.limit) ?? DEFAULT_PAGE_LIMIT;
  const limit = Math.min(rawLimit, MAX_PAGE_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationMeta(
  params: Pick<PaginationParams, "page" | "limit">,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);

  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1 && totalPages > 0,
  };
}
