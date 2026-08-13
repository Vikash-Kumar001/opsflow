import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "./request.types";

export type RequestUserSummary = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  isActive: boolean;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestSummary = {
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
  createdBy: RequestUserSummary;
  reviewedBy: RequestUserSummary | null;
};
