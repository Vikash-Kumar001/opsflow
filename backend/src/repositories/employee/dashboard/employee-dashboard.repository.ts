import type { RequestStatus } from "../../../domain/request/request.constants.js";
import {
  requestSummarySelect,
  type RequestSummaryRecord,
} from "../../../serializers/shared/request-summary.serializer.js";

type EmployeeRequestWhereInput = {
  deletedAt: null;
  createdById: string;
  status?: RequestStatus;
};

type EmployeeDashboardRequestDelegate = {
  count(args: { where: EmployeeRequestWhereInput }): Promise<number>;
  findMany(args: {
    where: EmployeeRequestWhereInput;
    orderBy: { updatedAt: "desc" };
    take: number;
    select: typeof requestSummarySelect;
  }): Promise<RequestSummaryRecord[]>;
};

export type EmployeeDashboardRepositoryClient = {
  request: EmployeeDashboardRequestDelegate;
};

export async function countEmployeeRequests(
  prisma: EmployeeDashboardRepositoryClient,
  employeeId: string,
  status?: RequestStatus,
): Promise<number> {
  const where: EmployeeRequestWhereInput = {
    deletedAt: null,
    createdById: employeeId,
  };

  if (status) {
    where.status = status;
  }

  return prisma.request.count({ where });
}

export async function listRecentEmployeeRequests(
  prisma: EmployeeDashboardRepositoryClient,
  employeeId: string,
  take: number,
): Promise<RequestSummaryRecord[]> {
  return prisma.request.findMany({
    where: {
      deletedAt: null,
      createdById: employeeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take,
    select: requestSummarySelect,
  });
}
