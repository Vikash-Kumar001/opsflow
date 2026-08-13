import {
  type AuditAction,
  type AuditEntityType,
} from "../../shared/audit-log.repository.js";
import {
  userSummarySelect,
  type UserSummaryRecord,
} from "../../../serializers/shared/user-summary.serializer.js";

export const auditLogSelect = {
  id: true,
  actorId: true,
  actor: {
    select: userSummarySelect,
  },
  action: true,
  entityType: true,
  targetUserId: true,
  targetUser: {
    select: userSummarySelect,
  },
  targetRequestId: true,
  targetRequest: {
    select: {
      id: true,
      requestNumber: true,
      title: true,
    },
  },
  targetCommentId: true,
  targetComment: {
    select: {
      id: true,
      content: true,
    },
  },
  metadata: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
} as const;

export type AuditLogTargetRequestRecord = {
  id: string;
  requestNumber: string;
  title: string;
};

export type AuditLogTargetCommentRecord = {
  id: string;
  content: string;
};

export type AuditLogRecord = {
  id: string;
  actorId: string | null;
  actor: UserSummaryRecord | null;
  action: AuditAction;
  entityType: AuditEntityType;
  targetUserId: string | null;
  targetUser: UserSummaryRecord | null;
  targetRequestId: string | null;
  targetRequest: AuditLogTargetRequestRecord | null;
  targetCommentId: string | null;
  targetComment: AuditLogTargetCommentRecord | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export type AdminAuditListFilters = {
  search?: string | undefined;
  action?: AuditAction | undefined;
  actorId?: string | undefined;
  entityType?: AuditEntityType | undefined;
  targetUserId?: string | undefined;
  targetRequestId?: string | undefined;
  targetCommentId?: string | undefined;
  createdFrom?: Date | undefined;
  createdTo?: Date | undefined;
  skip: number;
  take: number;
};

type AuditLogWhereInput = {
  id?: string;
  action?: AuditAction;
  actorId?: string;
  entityType?: AuditEntityType;
  targetUserId?: string;
  targetRequestId?: string;
  targetCommentId?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  OR?: Array<{
    actor?: {
      is: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      };
    };
    targetUser?: {
      is: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      };
    };
    targetRequest?: {
      is: {
        requestNumber?: { contains: string; mode: "insensitive" };
        title?: { contains: string; mode: "insensitive" };
      };
    };
  }>;
};

type AuditLogDelegate = {
  findMany(args: {
    where: AuditLogWhereInput;
    orderBy: { createdAt: "desc" };
    skip: number;
    take: number;
    select: typeof auditLogSelect;
  }): Promise<AuditLogRecord[]>;
  count(args: { where: AuditLogWhereInput }): Promise<number>;
  findUnique(args: {
    where: { id: string };
    select: typeof auditLogSelect;
  }): Promise<AuditLogRecord | null>;
};

export type AdminAuditRepositoryClient = {
  auditLog: AuditLogDelegate;
};

export async function listAuditLogs(
  prisma: AdminAuditRepositoryClient,
  filters: AdminAuditListFilters,
): Promise<{ auditLogs: AuditLogRecord[]; total: number }> {
  const where = buildAuditLogWhere(filters);

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip,
      take: filters.take,
      select: auditLogSelect,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { auditLogs, total };
}

export async function findAuditLogById(
  prisma: AdminAuditRepositoryClient,
  id: string,
): Promise<AuditLogRecord | null> {
  return prisma.auditLog.findUnique({
    where: { id },
    select: auditLogSelect,
  });
}

function buildAuditLogWhere(
  filters: Partial<AdminAuditListFilters>,
): AuditLogWhereInput {
  const where: AuditLogWhereInput = {};

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.actorId) {
    where.actorId = filters.actorId;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.targetUserId) {
    where.targetUserId = filters.targetUserId;
  }

  if (filters.targetRequestId) {
    where.targetRequestId = filters.targetRequestId;
  }

  if (filters.targetCommentId) {
    where.targetCommentId = filters.targetCommentId;
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {};

    if (filters.createdFrom) {
      where.createdAt.gte = filters.createdFrom;
    }

    if (filters.createdTo) {
      where.createdAt.lte = filters.createdTo;
    }
  }

  if (filters.search) {
    where.OR = [
      {
        actor: {
          is: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
      },
      {
        actor: {
          is: {
            email: { contains: filters.search, mode: "insensitive" },
          },
        },
      },
      {
        targetUser: {
          is: {
            email: { contains: filters.search, mode: "insensitive" },
          },
        },
      },
      {
        targetRequest: {
          is: {
            requestNumber: { contains: filters.search, mode: "insensitive" },
          },
        },
      },
      {
        targetRequest: {
          is: {
            title: { contains: filters.search, mode: "insensitive" },
          },
        },
      },
    ];
  }

  return where;
}
