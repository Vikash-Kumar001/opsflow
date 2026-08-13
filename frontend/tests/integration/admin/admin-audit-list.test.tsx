import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuditList } from "@/features/admin/audit";
import type {
  AdminAuditListData,
  AdminAuditListParams,
  AdminAuditLog,
} from "@/features/admin/audit";

const mocks = vi.hoisted(() => ({
  pathname: "/admin/audit-logs",
  searchParams: new URLSearchParams(),
  replace: vi.fn<(path: string) => void>(),
  listAdminAuditLogs:
    vi.fn<(params: AdminAuditListParams) => Promise<AdminAuditListData>>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/admin/audit/services/admin-audit.service", () => ({
  listAdminAuditLogs: mocks.listAdminAuditLogs,
  getAdminAuditLog: vi.fn(),
}));

describe("admin audit list", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.pathname = "/admin/audit-logs";
    mocks.searchParams = new URLSearchParams();
    mocks.replace.mockReset();
    mocks.listAdminAuditLogs.mockReset();
  });

  it("renders loading, readable audit events, actors, resources, and detail links", async () => {
    mocks.listAdminAuditLogs.mockResolvedValue(buildListResponse());

    renderAuditLogs();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(await screen.findByText("Audit Logs")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Audit logs" })).toBeInTheDocument();
    expect(screen.getAllByText("Role changed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Request approved").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Role changed from Employee to Manager/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/moving from In Review to Approved/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo Admin").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/REQ-7001/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("View audit event audit-1")).toHaveLength(2);
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
  });

  it("passes URL filter and page params to the server-backed audit list", async () => {
    mocks.searchParams = new URLSearchParams(
      "search=role&action=USER_ROLE_CHANGED&entityType=USER&actorId=11111111-1111-4111-8111-111111111111&targetUserId=22222222-2222-4222-8222-222222222222&targetRequestId=33333333-3333-4333-8333-333333333333&page=2&limit=25&createdFrom=2026-08-01&createdTo=2026-08-13",
    );
    mocks.listAdminAuditLogs.mockResolvedValue(buildListResponse());

    renderAuditLogs();

    await waitFor(() => {
      expect(mocks.listAdminAuditLogs).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
        search: "role",
        action: "USER_ROLE_CHANGED",
        entityType: "USER",
        actorId: "11111111-1111-4111-8111-111111111111",
        targetUserId: "22222222-2222-4222-8222-222222222222",
        targetRequestId: "33333333-3333-4333-8333-333333333333",
        createdFrom: "2026-08-01T00:00:00.000Z",
        createdTo: "2026-08-13T23:59:59.999Z",
      });
    });
  });

  it("updates URL state for filters, dates, IDs, reset, and pagination without persisting search text", async () => {
    mocks.searchParams = new URLSearchParams("search=role&page=2");
    mocks.listAdminAuditLogs.mockResolvedValue(
      buildListResponse({
        pagination: {
          page: 2,
          limit: 2,
          total: 12,
          totalPages: 6,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      }),
    );

    renderAuditLogs();

    await screen.findByText("Audit Logs");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/audit-logs?page=3",
    );

    fireEvent.change(screen.getByLabelText("Action"), {
      target: { value: "REQUEST_APPROVED" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/audit-logs?action=REQUEST_APPROVED",
    );

    fireEvent.change(screen.getByLabelText("Entity"), {
      target: { value: "REQUEST" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/audit-logs?entityType=REQUEST",
    );

    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-08-01" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/audit-logs?createdFrom=2026-08-01",
    );

    fireEvent.change(screen.getByLabelText("Actor ID"), {
      target: { value: "11111111-1111-4111-8111-111111111111" },
    });
    fireEvent.change(screen.getByLabelText("Target request ID"), {
      target: { value: "33333333-3333-4333-8333-333333333333" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply IDs" }));
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/audit-logs?actorId=11111111-1111-4111-8111-111111111111&targetRequestId=33333333-3333-4333-8333-333333333333",
    );

    const replaceCallCount = mocks.replace.mock.calls.length;
    fireEvent.change(screen.getByLabelText("Search audit logs"), {
      target: { value: "approval" },
    });

    await waitFor(() => {
      expect(mocks.listAdminAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "approval" }),
      );
    });
    expect(mocks.replace).toHaveBeenCalledTimes(replaceCallCount);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/admin/audit-logs");
  });

  it("renders no-data, no-match, and error states", async () => {
    mocks.listAdminAuditLogs.mockResolvedValueOnce(
      buildListResponse({ auditLogs: [], total: 0 }),
    );

    const { unmount } = renderAuditLogs();

    expect(await screen.findByText("No audit events yet")).toBeInTheDocument();
    unmount();

    mocks.searchParams = new URLSearchParams("search=missing");
    mocks.listAdminAuditLogs.mockResolvedValueOnce(
      buildListResponse({ auditLogs: [], total: 0 }),
    );

    const secondRender = renderAuditLogs();

    expect(await screen.findByText("No matching audit events")).toBeInTheDocument();
    secondRender.unmount();

    mocks.searchParams = new URLSearchParams();
    mocks.listAdminAuditLogs.mockRejectedValueOnce(
      new Error("Audit service unavailable"),
    );

    renderAuditLogs();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Audit service unavailable")).toBeInTheDocument();
  });
});

function renderAuditLogs() {
  return renderWithQueryClient(<AdminAuditList />);
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

function buildListResponse(
  overrides: Partial<AdminAuditListData & { total: number }> = {},
): AdminAuditListData {
  const auditLogs = overrides.auditLogs ?? [
    buildAuditEvent(),
    buildAuditEvent({
      id: "audit-2",
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
  ];
  const total = overrides.total ?? 12;

  return {
    auditLogs,
    pagination: overrides.pagination ?? {
      page: 1,
      limit: 2,
      total,
      totalPages: Math.max(1, Math.ceil(total / 2)),
      hasNextPage: total > 2,
      hasPreviousPage: false,
    },
  };
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
