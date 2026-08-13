import { NotFoundError } from "../../../errors/not-found.error.js";
import type { AdminRequestRepositoryClient } from "../../../repositories/admin/requests/admin-request.repository.js";
import { findAdminRequestById } from "../../../repositories/admin/requests/admin-request.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";

export async function getAdminRequestById(
  prisma: AdminRequestRepositoryClient,
  id: string,
): Promise<RequestSummaryRecord> {
  const request = await findAdminRequestById(prisma, id);

  if (!request) {
    throw new NotFoundError("Request not found");
  }

  return request;
}
