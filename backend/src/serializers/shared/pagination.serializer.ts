import type { PaginationMeta } from "../../utils/pagination.js";

export type SerializedPagination = PaginationMeta;

export function serializePagination(
  pagination: PaginationMeta,
): SerializedPagination {
  return pagination;
}
