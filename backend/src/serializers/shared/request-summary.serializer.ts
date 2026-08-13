import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../domain/request/request.constants.js";
import {
  serializeUserSummary,
  type SerializedUserSummary,
  type UserSummaryRecord,
  userSummarySelect,
} from "./user-summary.serializer.js";

export const requestSummarySelect = {
  id: true,
  requestNumber: true,
  title: true,
  description: true,
  category: true,
  priority: true,
  status: true,
  metadata: true,
  createdById: true,
  reviewedById: true,
  reviewNotes: true,
  rejectionReason: true,
  submittedAt: true,
  reviewedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: userSummarySelect,
  },
  reviewedBy: {
    select: userSummarySelect,
  },
} as const;

export type RequestSummaryRecord = {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  metadata: Record<string, unknown> | null;
  createdById: string;
  reviewedById: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserSummaryRecord;
  reviewedBy: UserSummaryRecord | null;
};

export type SerializedRequestSummary = {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  metadata: Record<string, unknown> | null;
  createdById: string;
  reviewedById: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: SerializedUserSummary;
  reviewedBy: SerializedUserSummary | null;
};

export function serializeRequestSummary(
  request: RequestSummaryRecord,
): SerializedRequestSummary {
  return {
    id: request.id,
    requestNumber: request.requestNumber,
    title: request.title,
    description: request.description,
    category: request.category,
    priority: request.priority,
    status: request.status,
    metadata: request.metadata,
    createdById: request.createdById,
    reviewedById: request.reviewedById,
    reviewNotes: request.reviewNotes,
    rejectionReason: request.rejectionReason,
    submittedAt: request.submittedAt?.toISOString() ?? null,
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    deletedAt: request.deletedAt?.toISOString() ?? null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    createdBy: serializeUserSummary(request.createdBy),
    reviewedBy: request.reviewedBy
      ? serializeUserSummary(request.reviewedBy)
      : null,
  };
}
