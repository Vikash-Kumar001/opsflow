import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmployeeDashboard } from "@/features/employee/dashboard";
import type { EmployeeDashboardData } from "@/features/employee/dashboard";

const mocks = vi.hoisted(() => ({
  getEmployeeDashboard: vi.fn<() => Promise<EmployeeDashboardData>>(),
}));

vi.mock(
  "@/features/employee/dashboard/services/employee-dashboard.service",
  () => ({
    getEmployeeDashboard: mocks.getEmployeeDashboard,
  }),
);

describe("employee dashboard", () => {
  beforeEach(() => {
    mocks.getEmployeeDashboard.mockReset();
  });

  it("renders loading skeleton while dashboard data is pending", () => {
    mocks.getEmployeeDashboard.mockReturnValue(new Promise(() => undefined));

    renderDashboard();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading statistics")).toBeInTheDocument();
  });

  it("renders dashboard metrics, quick actions, and recent own requests", async () => {
    mocks.getEmployeeDashboard.mockResolvedValue(buildDashboard());

    renderDashboard();

    expect(await screen.findByText("Employee dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total requests")).toBeInTheDocument();
    expect(screen.getByText("Awaiting review")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getAllByText("Laptop request").length).toBeGreaterThan(0);
    expect(screen.getAllByText("REQ-1001").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "New request" })[0]).toHaveAttribute(
      "href",
      "/employee/requests/new",
    );
    expect(
      screen.getByRole("link", { name: "View my requests" }),
    ).toHaveAttribute("href", "/employee/requests");
    expect(screen.queryByText("Other employee request")).not.toBeInTheDocument();
  });

  it("renders an empty state when the employee has no requests", async () => {
    mocks.getEmployeeDashboard.mockResolvedValue({
      metrics: {
        totalRequests: 0,
        draftRequests: 0,
        pendingRequests: 0,
        inReviewRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        cancelledRequests: 0,
      },
      recentRequests: [],
    });

    renderDashboard();

    expect(await screen.findByText("No requests yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Create your first request to start tracking approvals/i),
    ).toBeInTheDocument();
  });

  it("renders an error state and retries on demand", async () => {
    mocks.getEmployeeDashboard
      .mockRejectedValueOnce(new Error("Dashboard unavailable"))
      .mockResolvedValueOnce(buildDashboard());

    renderDashboard();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Dashboard unavailable")).toBeInTheDocument();

    screen.getByRole("button", { name: "Try again" }).click();

    await waitFor(() => {
      expect(mocks.getEmployeeDashboard).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getAllByText("Laptop request").length).toBeGreaterThan(0);
    });
  });
});

function renderDashboard() {
  return renderWithQueryClient(<EmployeeDashboard />);
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

function buildDashboard(): EmployeeDashboardData {
  return {
    metrics: {
      totalRequests: 3,
      draftRequests: 1,
      pendingRequests: 1,
      inReviewRequests: 0,
      approvedRequests: 1,
      rejectedRequests: 0,
      cancelledRequests: 0,
    },
    recentRequests: [
      {
        id: "request-1",
        requestNumber: "REQ-1001",
        title: "Laptop request",
        description: "Need a laptop for onboarding.",
        category: "EQUIPMENT",
        priority: "HIGH",
        status: "PENDING",
        metadata: null,
        createdById: "employee-1",
        reviewedById: null,
        reviewNotes: null,
        rejectionReason: null,
        submittedAt: "2026-08-13T08:00:00.000Z",
        reviewedAt: null,
        deletedAt: null,
        createdAt: "2026-08-13T07:00:00.000Z",
        updatedAt: "2026-08-13T08:00:00.000Z",
        createdBy: {
          id: "employee-1",
          name: "Demo Employee",
          email: "employee@opsflow.demo",
          role: "EMPLOYEE",
          isActive: true,
          managerId: "manager-1",
          createdAt: "2026-08-13T07:00:00.000Z",
          updatedAt: "2026-08-13T07:00:00.000Z",
        },
        reviewedBy: null,
      },
    ],
  };
}
