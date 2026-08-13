import {
  buildPaginationMeta,
  parsePagination,
} from "../../../utils/pagination.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import { listManagerTeamRequests } from "../../../repositories/manager/requests/manager-request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { SerializedUserSummary } from "../../../serializers/shared/user-summary.serializer.js";
import type { ListRequestsQuery } from "../../../validators/shared/requests/request.schemas.js";

export type ListTeamRequestsResult = {
  requests: RequestSummaryRecord[];
  pagination: ReturnType<typeof buildPaginationMeta>;
};

export async function listTeamRequests(
  prisma: PrismaClientLike,
  actor: SerializedUserSummary,
  query: ListRequestsQuery,
): Promise<ListTeamRequestsResult> {
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

  const result = await listManagerTeamRequests(prisma, actor.id, filters);

  return {
    requests: result.requests,
    pagination: buildPaginationMeta(paginationParams, result.total),
  };
}
