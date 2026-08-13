import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminDashboard } from "@/features/admin/dashboard";
import type { AdminDashboardData } from "@/features/admin/dashboard";

const mocks = vi.hoisted(() => ({
  getAdminDashboard: vi.fn<() => Promise<AdminDashboardData>>(),
}));

vi.mock("@/features/admin/dashboard/services/admin-dashboard.service", () => ({
  getAdminDashboard: mocks.getAdminDashboard,
}));

describe("admin dashboard", () => {
  beforeEach(() => {
    mocks.getAdminDashboard.mockReset();
  });

  it("renders loading skeleton while dashboard data is pending", () => {
    mocks.getAdminDashboard.mockReturnValue(new Promise(() => undefined));

    renderDashboard();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading statistics")).toBeInTheDocument();
  });

  it("renders organization metrics, charts, recent requests, and activity", async () => {
    mocks.getAdminDashboard.mockResolvedValue(buildDashboard());

    renderDashboard();

    expect(await screen.findByText("Admin dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total users")).toBeInTheDocument();
    expect(screen.getByText("Total requests")).toBeInTheDocument();
    expect(screen.getByText("Request trend")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Daily request trend over the last 7 days"),
    ).toBeInTheDocument();
    expect(screen.getByText("Request status")).toBeInTheDocument();
    expect(screen.getByText("Request category")).toBeInTheDocument();
    expect(screen.getByText("User roles")).toBeInTheDocument();
    expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    expect(screen.getByText("admin@opsflow.demo")).toBeInTheDocument();
    expect(screen.getByText("Request approved")).toBeInTheDocument();
    expect(screen.queryByText("Manager dashboard")).not.toBeInTheDocument();
  });

  it("renders an empty state when there is no organization activity", async () => {
    mocks.getAdminDashboard.mockResolvedValue({
      metrics: {
        totalUsers: 0,
        activeUsers: 0,
        roleCounts: { ADMIN: 0, MANAGER: 0, EMPLOYEE: 0 },
        totalRequests: 0,
        statusCounts: {
          DRAFT: 0,
          PENDING: 0,
          IN_REVIEW: 0,
          APPROVED: 0,
          REJECTED: 0,
          CANCELLED: 0,
        },
        categoryCounts: {
          LEAVE: 0,
          EXPENSE: 0,
          EQUIPMENT: 0,
          SOFTWARE_ACCESS: 0,
          WORK_FROM_HOME: 0,
          TRAVEL: 0,
          PROCUREMENT: 0,
          OTHER: 0,
        },
      },
      requestTrendDays: 7,
      recentRequestTrend: [],
      recentActivity: [],
      recentRequests: [],
    });

    renderDashboard();

    expect(
      await screen.findByText("No organization activity yet"),
    ).toBeInTheDocument();
  });

  it("renders an error state and retries on demand", async () => {
    mocks.getAdminDashboard
      .mockRejectedValueOnce(new Error("Admin dashboard unavailable"))
      .mockResolvedValueOnce(buildDashboard());

    renderDashboard();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Admin dashboard unavailable")).toBeInTheDocument();

    screen.getByRole("button", { name: "Try again" }).click();

    await waitFor(() => {
      expect(mocks.getAdminDashboard).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    });
  });
});

function renderDashboard() {
  return renderWithQueryClient(<AdminDashboard />);
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

function buildDashboard(): AdminDashboardData {
  const admin = buildUser("admin-1", "Admin User", "admin@opsflow.demo", "ADMIN");
  const employee = buildUser(
    "employee-1",
    "Demo Employee",
    "employee@opsflow.demo",
    "EMPLOYEE",
  );

  return {
    metrics: {
      totalUsers: 9,
      activeUsers: 8,
      roleCounts: { ADMIN: 1, MANAGER: 2, EMPLOYEE: 6 },
      totalRequests: 18,
      statusCounts: {
        DRAFT: 2,
        PENDING: 5,
        IN_REVIEW: 3,
        APPROVED: 6,
        REJECTED: 1,
        CANCELLED: 1,
      },
      categoryCounts: {
        LEAVE: 3,
        EXPENSE: 2,
        EQUIPMENT: 4,
        SOFTWARE_ACCESS: 3,
        WORK_FROM_HOME: 2,
        TRAVEL: 1,
        PROCUREMENT: 2,
        OTHER: 1,
      },
    },
    requestTrendDays: 7,
    recentRequestTrend: [
      { date: "2026-08-07", count: 1 },
      { date: "2026-08-08", count: 0 },
      { date: "2026-08-09", count: 2 },
      { date: "2026-08-10", count: 1 },
      { date: "2026-08-11", count: 3 },
      { date: "2026-08-12", count: 2 },
      { date: "2026-08-13", count: 4 },
    ],
    recentRequests: [
      {
        id: "request-1",
        requestNumber: "REQ-3001",
        title: "Hardware refresh",
        description: "Need a replacement laptop for design work.",
        category: "EQUIPMENT",
        priority: "HIGH",
        status: "APPROVED",
        metadata: null,
        createdById: employee.id,
        reviewedById: admin.id,
        reviewNotes: "Approved for replacement cycle.",
        rejectionReason: null,
        submittedAt: "2026-08-13T08:00:00.000Z",
        reviewedAt: "2026-08-13T09:00:00.000Z",
        deletedAt: null,
        createdAt: "2026-08-13T07:00:00.000Z",
        updatedAt: "2026-08-13T09:00:00.000Z",
        createdBy: employee,
        reviewedBy: admin,
      },
    ],
    recentActivity: [
      {
        id: "audit-1",
        actorId: admin.id,
        actor: admin,
        action: "REQUEST_APPROVED",
        entityType: "REQUEST",
        targetUserId: null,
        targetUser: null,
        targetRequestId: "request-1",
        targetRequest: {
          id: "request-1",
          requestNumber: "REQ-3001",
          title: "Hardware refresh",
        },
        targetCommentId: null,
        targetComment: null,
        metadata: { status: "APPROVED" },
        correlationId: "correlation-1",
        ipAddress: null,
        userAgent: null,
        createdAt: "2026-08-13T09:00:00.000Z",
      },
    ],
  };
}

function buildUser(
  id: string,
  name: string,
  email: string,
  role: "ADMIN" | "MANAGER" | "EMPLOYEE",
) {
  return {
    id,
    name,
    email,
    role,
    isActive: true,
    managerId: null,
    createdAt: "2026-08-13T07:00:00.000Z",
    updatedAt: "2026-08-13T07:00:00.000Z",
  };
}
