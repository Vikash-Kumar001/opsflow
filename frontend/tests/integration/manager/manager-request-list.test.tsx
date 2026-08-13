import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ManagerRequestList } from "@/features/manager/requests";
import type {
  ManagerRequestListData,
  ManagerRequestListParams,
  TeamRequest,
} from "@/features/manager/requests";

const mocks = vi.hoisted(() => ({
  pathname: "/manager/requests",
  searchParams: new URLSearchParams(),
  replace: vi.fn<(path: string) => void>(),
  listTeamRequests:
    vi.fn<(params: ManagerRequestListParams) => Promise<ManagerRequestListData>>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/manager/requests/services/manager-request.service", () => ({
  listTeamRequests: mocks.listTeamRequests,
}));

describe("manager request list", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.pathname = "/manager/requests";
    mocks.searchParams = new URLSearchParams();
    mocks.replace.mockReset();
    mocks.listTeamRequests.mockReset();
  });

  it("renders loading, team request data, requester summaries, and review links", async () => {
    mocks.listTeamRequests.mockResolvedValue(buildListResponse());

    renderRequestList("team");

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(await screen.findByText("Team requests")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Team requests" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo Employee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("employee@opsflow.demo").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByLabelText("Review REQ-2001")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Approval queue" }),
    ).toHaveAttribute("href", "/manager/approvals");
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit Logs")).not.toBeInTheDocument();
  });

  it("passes URL query params to the server-backed team list request", async () => {
    mocks.searchParams = new URLSearchParams(
      "search=laptop&status=PENDING&category=EQUIPMENT&priority=HIGH&page=2&sortBy=title&sortDirection=asc",
    );
    mocks.listTeamRequests.mockResolvedValue(buildListResponse());

    renderRequestList("team");

    await waitFor(() => {
      expect(mocks.listTeamRequests).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: "laptop",
        status: "PENDING",
        category: "EQUIPMENT",
        priority: "HIGH",
        sortBy: "title",
        sortDirection: "asc",
      });
    });
  });

  it("updates URL state for filters, reset, and pagination without persisting search text", async () => {
    mocks.searchParams = new URLSearchParams("search=laptop&page=2");
    mocks.listTeamRequests.mockResolvedValue(
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

    renderRequestList("team");

    await screen.findByText("Team requests");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/manager/requests?page=3",
    );

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "APPROVED" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/manager/requests?status=APPROVED",
    );

    const replaceCallCount = mocks.replace.mock.calls.length;
    fireEvent.change(screen.getByLabelText("Search team requests"), {
      target: { value: "travel" },
    });

    await waitFor(() => {
      expect(mocks.listTeamRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "travel" }),
      );
    });
    expect(mocks.replace).toHaveBeenCalledTimes(replaceCallCount);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/manager/requests");
  });

  it("renders the approval queue with pending focus and server status scope", async () => {
    mocks.pathname = "/manager/approvals";
    mocks.listTeamRequests.mockResolvedValue(buildListResponse());

    renderRequestList("queue");

    expect(await screen.findByText("Approval queue")).toBeInTheDocument();
    expect(screen.getByText("Queue focus")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Team requests" }),
    ).toHaveAttribute("href", "/manager/requests");

    await waitFor(() => {
      expect(mocks.listTeamRequests).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PENDING" }),
      );
    });

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "IN_REVIEW" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/manager/approvals?status=IN_REVIEW",
    );
  });

  it("renders no-data, no-results, and error states", async () => {
    mocks.listTeamRequests.mockResolvedValueOnce(
      buildListResponse({ requests: [], total: 0 }),
    );

    const { unmount } = renderRequestList("team");

    expect(await screen.findByText("No team requests yet")).toBeInTheDocument();
    unmount();

    mocks.searchParams = new URLSearchParams("search=missing");
    mocks.listTeamRequests.mockResolvedValueOnce(
      buildListResponse({ requests: [], total: 0 }),
    );

    const secondRender = renderRequestList("team");

    expect(await screen.findByText("No matching team requests")).toBeInTheDocument();
    secondRender.unmount();

    mocks.searchParams = new URLSearchParams();
    mocks.listTeamRequests.mockRejectedValueOnce(
      new Error("Team requests unavailable"),
    );

    renderRequestList("team");

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Team requests unavailable")).toBeInTheDocument();
  });
});

function renderRequestList(variant: "team" | "queue") {
  return renderWithQueryClient(<ManagerRequestList variant={variant} />);
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
  overrides: Partial<ManagerRequestListData & { total: number }> = {},
): ManagerRequestListData {
  const requests = overrides.requests ?? [
    buildTeamRequest({
      id: "request-1",
      requestNumber: "REQ-2001",
      title: "Hardware refresh",
      status: "PENDING",
      category: "EQUIPMENT",
      priority: "HIGH",
    }),
    buildTeamRequest({
      id: "request-2",
      requestNumber: "REQ-2002",
      title: "Travel approval",
      status: "IN_REVIEW",
      category: "TRAVEL",
      priority: "MEDIUM",
    }),
  ];
  const total = overrides.total ?? 12;

  return {
    requests,
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

function buildTeamRequest(overrides: Partial<TeamRequest>): TeamRequest {
  return {
    id: "request-1",
    requestNumber: "REQ-2000",
    title: "Demo team request",
    description: "Demo team request.",
    category: "OTHER",
    priority: "MEDIUM",
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
    ...overrides,
  };
}
