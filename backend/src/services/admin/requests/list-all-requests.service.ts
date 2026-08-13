import {
  buildPaginationMeta,
  parsePagination,
} from "../../../utils/pagination.js";
import type { AdminRequestRepositoryClient } from "../../../repositories/admin/requests/admin-request.repository.js";
import { listAdminRequests } from "../../../repositories/admin/requests/admin-request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";
import type { ListRequestsQuery } from "../../../validators/shared/requests/request.schemas.js";

export type ListAllRequestsResult = {
  requests: RequestSummaryRecord[];
  pagination: ReturnType<typeof buildPaginationMeta>;
};

export async function listAllRequests(
  prisma: AdminRequestRepositoryClient,
  query: ListRequestsQuery,
): Promise<ListAllRequestsResult> {
  const paginationParams = parsePagination(query);
  const filters = {
    skip: paginationParams.skip,
    take: paginationParams.take,
  };

  for (const key of [
    "search",
    "status",
    "category",
    "priority",
    "createdFrom",
    "createdTo",
    "sortBy",
    "sortDirection",
  ] as const) {
    const value = query[key];

    if (value !== undefined) {
      Object.assign(filters, { [key]: value });
    }
  }

  const result = await listAdminRequests(prisma, filters);

  return {
    requests: result.requests,
    pagination: buildPaginationMeta(paginationParams, result.total),
  };
}
