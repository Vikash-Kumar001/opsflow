import { NotFoundError } from "../../../errors/not-found.error.js";
import type { PrismaClientLike } from "../../../lib/prisma.js";
import {
  findAdminRequestById,
  softDeleteAdminRequest,
  type AdminRequestRepositoryClient,
} from "../../../repositories/admin/requests/admin-request.repository.js";
import { createRequestAuditLog } from "../../../repositories/shared/audit-log.repository.js";
import type { RequestSummaryRecord } from "../../../serializers/shared/request-summary.serializer.js";

type DeleteRequestClient = AdminRequestRepositoryClient &
  Pick<PrismaClientLike, "$transaction" | "auditLog">;

export async function deleteRequestAsAdmin(
  prisma: DeleteRequestClient,
  actorId: string,
  id: string,
): Promise<RequestSummaryRecord> {
  return prisma.$transaction(async (transaction) => {
    const request = await findAdminRequestById(transaction, id);

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    const deletedRequest = await softDeleteAdminRequest(
      transaction,
      id,
      new Date(),
    );

    await createRequestAuditLog(transaction, {
      actorId,
      action: "REQUEST_DELETED",
      requestId: deletedRequest.id,
      metadata: {
        requestNumber: deletedRequest.requestNumber,
      },
    });

    return deletedRequest;
  });
}
