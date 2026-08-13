import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuditDetail } from "@/features/admin/audit";
import type { AdminAuditLog, AdminAuditLogData } from "@/features/admin/audit";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  getAdminAuditLog: vi.fn<(id: string) => Promise<AdminAuditLogData>>(),
}));

vi.mock("@/features/admin/audit/services/admin-audit.service", () => ({
  listAdminAuditLogs: vi.fn(),
  getAdminAuditLog: mocks.getAdminAuditLog,
}));

describe("admin audit detail", () => {
  beforeEach(() => {
    mocks.getAdminAuditLog.mockReset();
  });

  it("renders readable role-change metadata and omits sensitive metadata keys", async () => {
    mocks.getAdminAuditLog.mockResolvedValue({
      auditLog: buildAuditEvent(),
    });

    renderDetail();

    expect(await screen.findByText("Event summary")).toBeInTheDocument();
    expect(screen.getAllByText("Role changed").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Role changed from Employee to Manager/i),
    ).toBeInTheDocument();
    expect(screen.getByText("From Role")).toBeInTheDocument();
    expect(screen.getByText("Employee")).toBeInTheDocument();
    expect(screen.getByText("To Role")).toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.getAllByText("req-abc").length).toBeGreaterThan(0);
    expect(screen.getByText("Demo Admin")).toBeInTheDocument();
    expect(screen.queryByText(/super-secret/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Password/i)).not.toBeInTheDocument();
  });

  it("renders readable request approval metadata and resource context", async () => {
    mocks.getAdminAuditLog.mockResolvedValue({
      auditLog: buildAuditEvent({
        action: "REQUEST_APPROVED",
        entityType: "REQUEST",
        targetUserId: null,
        targetUser: null,
        targetRequestId: "request-1",
        targetRequest: {
          id: "request-1",
          requestNumber: "REQ-7001",
          title: "Hardware refresh",
        },
        metadata: {
          fromStatus: "IN_REVIEW",
          toStatus: "APPROVED",
          reviewNotes: "Approved for replacement cycle.",
        },
      }),
    });

    renderDetail();

    expect(await screen.findByText("Request approved")).toBeInTheDocument();
    expect(
      screen.getByText(/moving from In Review to Approved/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("REQ-7001 - Hardware refresh").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Review Notes")).toBeInTheDocument();
    expect(
      screen.getByText("Approved for replacement cycle."),
    ).toBeInTheDocument();
  });

  it("renders not-found and generic error states", async () => {
    mocks.getAdminAuditLog.mockRejectedValueOnce(
      new ApiError({
        status: 404,
        code: "NOT_FOUND",
        message: "Audit event not found",
      }),
    );

    const { unmount } = renderDetail();

    expect(await screen.findByText("Audit event not found")).toBeInTheDocument();
    unmount();

    mocks.getAdminAuditLog.mockRejectedValueOnce(
      new Error("Audit lookup failed"),
    );

    renderDetail();

    expect(await screen.findByText("Audit event unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("We could not load this audit event."),
    ).toBeInTheDocument();
  });
});

function renderDetail() {
  return renderWithQueryClient(<AdminAuditDetail auditLogId="audit-1" />);
}

function renderWithQueryClient(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
}

function buildAuditEvent(overrides: Partial<AdminAuditLog> = {}): AdminAuditLog {
  return {
    id: "audit-1",
    actorId: "admin-1",
    actor: buildUser({
      id: "admin-1",
      name: "Demo Admin",
      email: "admin@opsflow.demo",
      role: "ADMIN",
    }),
    action: "USER_ROLE_CHANGED",
    entityType: "USER",
    targetUserId: "employee-1",
    targetUser: buildUser({
      id: "employee-1",
      name: "Demo Employee",
      email: "employee@opsflow.demo",
      role: "MANAGER",
    }),
    targetRequestId: null,
    targetRequest: null,
    targetCommentId: null,
    targetComment: null,
    metadata: {
      fromRole: "EMPLOYEE",
      toRole: "MANAGER",
      correlationId: "req-abc",
      password: "super-secret",
    },
    correlationId: "req-abc",
    ipAddress: "127.0.0.1",
    userAgent: "Vitest",
    createdAt: "2026-08-13T10:00:00.000Z",
    ...overrides,
  };
}

function buildUser(overrides: Partial<AdminAuditLog["actor"]> = {}) {
  return {
    id: "user-1",
    name: "Demo User",
    email: "user@opsflow.demo",
    role: "EMPLOYEE" as const,
    isActive: true,
    managerId: "manager-1",
    createdAt: "2026-08-13T07:00:00.000Z",
    updatedAt: "2026-08-13T07:00:00.000Z",
    ...overrides,
  };
}
