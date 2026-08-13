import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ManagerDashboard } from "@/features/manager/dashboard";
import type { ManagerDashboardData } from "@/features/manager/dashboard";

const mocks = vi.hoisted(() => ({
  getManagerDashboard: vi.fn<() => Promise<ManagerDashboardData>>(),
}));

vi.mock(
  "@/features/manager/dashboard/services/manager-dashboard.service",
  () => ({
    getManagerDashboard: mocks.getManagerDashboard,
  }),
);

describe("manager dashboard", () => {
  beforeEach(() => {
    mocks.getManagerDashboard.mockReset();
  });

  it("renders loading skeleton while dashboard data is pending", () => {
    mocks.getManagerDashboard.mockReturnValue(new Promise(() => undefined));

    renderDashboard();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading statistics")).toBeInTheDocument();
  });

  it("renders scoped manager metrics, approval CTA, and recent team requests", async () => {
    mocks.getManagerDashboard.mockResolvedValue(buildDashboard());

    renderDashboard();

    expect(await screen.findByText("Manager dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getAllByText("In review").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Urgent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    expect(screen.getAllByText("REQ-2001").length).toBeGreaterThan(0);
    expect(screen.getByText("Demo Employee")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Approval queue" })[0],
    ).toHaveAttribute("href", "/manager/approvals");
    expect(screen.queryByText("Other manager report")).not.toBeInTheDocument();
  });

  it("renders an empty state when the manager has no team activity", async () => {
    mocks.getManagerDashboard.mockResolvedValue({
      metrics: {
        pendingApprovals: 0,
        inReview: 0,
        approvedRecent: 0,
        rejectedRecent: 0,
        urgentRequests: 0,
      },
      recentPeriodDays: 30,
      recentTeamRequests: [],
    });

    renderDashboard();

    expect(await screen.findByText("No team activity yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Submitted requests from your direct reports/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Team requests" })).toHaveAttribute(
      "href",
      "/manager/requests",
    );
  });

  it("renders an error state and retries on demand", async () => {
    mocks.getManagerDashboard
      .mockRejectedValueOnce(new Error("Manager dashboard unavailable"))
      .mockResolvedValueOnce(buildDashboard());

    renderDashboard();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Manager dashboard unavailable")).toBeInTheDocument();

    screen.getByRole("button", { name: "Try again" }).click();

    await waitFor(() => {
      expect(mocks.getManagerDashboard).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    });
  });
});

function renderDashboard() {
  return renderWithQueryClient(<ManagerDashboard />);
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

function buildDashboard(): ManagerDashboardData {
  return {
    metrics: {
      pendingApprovals: 2,
      inReview: 1,
      approvedRecent: 4,
      rejectedRecent: 1,
      urgentRequests: 1,
    },
    recentPeriodDays: 30,
    recentTeamRequests: [
      {
        id: "request-1",
        requestNumber: "REQ-2001",
        title: "Hardware refresh",
        description: "Need a replacement laptop for design work.",
        category: "EQUIPMENT",
        priority: "URGENT",
        status: "PENDING",
        reviewNotes: null,
        rejectionReason: null,
        submittedAt: "2026-08-13T08:00:00.000Z",
        reviewedAt: null,
        createdAt: "2026-08-13T07:00:00.000Z",
        updatedAt: "2026-08-13T08:00:00.000Z",
        requester: {
          id: "employee-1",
          name: "Demo Employee",
          email: "employee@opsflow.demo",
          role: "EMPLOYEE",
          isActive: true,
          managerId: "manager-1",
          createdAt: "2026-08-13T07:00:00.000Z",
          updatedAt: "2026-08-13T07:00:00.000Z",
        },
        reviewer: null,
      },
    ],
  };
}
