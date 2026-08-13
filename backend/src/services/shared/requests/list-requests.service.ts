import {
  buildPaginationMeta,
  parsePagination,
} from "../../../utils/pagination.js";
import { listVisibleRequests } from "../../../repositories/shared/requests/request.repository.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";
import type { ListRequestsQuery } from "../../../validators/shared/requests/request.schemas.js";

export type ListRequestsResult = {
  requests: RequestSummaryRecord[];
  pagination: ReturnType<typeof buildPaginationMeta>;
};

export async function listRequests(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  query: ListRequestsQuery,
): Promise<ListRequestsResult> {
  const paginationParams = parsePagination(query);
  const filters = {
    skip: paginationParams.skip,
    take: paginationParams.take,
  };

  const optionalFilters = [
    "search",
    "status",
    "category",
    "priority",
    "createdFrom",
    "createdTo",
    "sortBy",
    "sortDirection",
  ] as const;

  for (const key of optionalFilters) {
    const value = query[key];

    if (value !== undefined) {
      Object.assign(filters, { [key]: value });
    }
  }

  const result = await listVisibleRequests(prisma, actor, filters);

  return {
    requests: result.requests,
    pagination: buildPaginationMeta(paginationParams, result.total),
  };
}
