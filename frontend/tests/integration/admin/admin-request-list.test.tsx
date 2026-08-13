import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminRequestList } from "@/features/admin/requests";
import type {
  AdminRequestData,
  AdminRequestListData,
  AdminRequestListParams,
} from "@/features/admin/requests";
import type { RequestSummary } from "@/features/shared/requests";

const mocks = vi.hoisted(() => ({
  pathname: "/admin/requests",
  searchParams: new URLSearchParams(),
  replace: vi.fn<(path: string) => void>(),
  listAdminRequests:
    vi.fn<(params: AdminRequestListParams) => Promise<AdminRequestListData>>(),
  deleteAdminRequest: vi.fn<(id: string) => Promise<AdminRequestData>>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/admin/requests/services/admin-request.service", () => ({
  listAdminRequests: mocks.listAdminRequests,
  getAdminRequest: vi.fn(),
  deleteAdminRequest: mocks.deleteAdminRequest,
}));

describe("admin request list", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.pathname = "/admin/requests";
    mocks.searchParams = new URLSearchParams();
    mocks.replace.mockReset();
    mocks.listAdminRequests.mockReset();
    mocks.deleteAdminRequest.mockReset();
  });

  it("renders loading, organization requests, people summaries, and actions", async () => {
    mocks.listAdminRequests.mockResolvedValue(buildListResponse());

    renderRequests();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(await screen.findByText("Requests")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Organization requests" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo Employee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo Manager").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("View REQ-5001")).toHaveLength(2);
    expect(screen.getAllByLabelText("Archive REQ-5001")).toHaveLength(2);
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
  });

  it("passes URL query params to the server-backed organization request list", async () => {
    mocks.searchParams = new URLSearchParams(
      "search=laptop&status=PENDING&category=EQUIPMENT&priority=HIGH&page=2&sortBy=title&sortDirection=asc&createdFrom=2026-08-01&createdTo=2026-08-13",
    );
    mocks.listAdminRequests.mockResolvedValue(buildListResponse());

    renderRequests();

    await waitFor(() => {
      expect(mocks.listAdminRequests).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: "laptop",
        status: "PENDING",
        category: "EQUIPMENT",
        priority: "HIGH",
        sortBy: "title",
        sortDirection: "asc",
        createdFrom: "2026-08-01T00:00:00.000Z",
        createdTo: "2026-08-13T00:00:00.000Z",
      });
    });
  });

  it("updates URL state for filters, date bounds, sort, reset, and pagination without persisting search text", async () => {
    mocks.searchParams = new URLSearchParams("search=laptop&page=2");
    mocks.listAdminRequests.mockResolvedValue(
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

    renderRequests();

    await screen.findByText("Requests");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/requests?page=3",
    );

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "APPROVED" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/requests?status=APPROVED",
    );

    fireEvent.change(screen.getByLabelText("Created from"), {
      target: { value: "2026-08-01" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/requests?createdFrom=2026-08-01",
    );

    fireEvent.change(screen.getByLabelText("Sort"), {
      target: { value: "title:asc" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/requests?sortBy=title&sortDirection=asc",
    );

    const replaceCallCount = mocks.replace.mock.calls.length;
    fireEvent.change(screen.getByLabelText("Search organization requests"), {
      target: { value: "travel" },
    });

    await waitFor(() => {
      expect(mocks.listAdminRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "travel" }),
      );
    });
    expect(mocks.replace).toHaveBeenCalledTimes(replaceCallCount);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/admin/requests");
  });

  it("archives a request through the permitted Admin delete action", async () => {
    const request = buildRequest();
    mocks.listAdminRequests.mockResolvedValue(buildListResponse({ requests: [request] }));
    mocks.deleteAdminRequest.mockResolvedValue({
      request: { ...request, deletedAt: "2026-08-13T10:00:00.000Z" },
    });

    renderRequests();

    fireEvent.click((await screen.findAllByLabelText("Archive REQ-5001"))[0]);
    fireEvent.click(screen.getByRole("button", { name: "Archive request" }));

    await waitFor(() => {
      expect(mocks.deleteAdminRequest).toHaveBeenCalledWith("request-1");
    });
    expect(await screen.findByText("REQ-5001 was archived.")).toBeInTheDocument();
  });

  it("renders no-data, no-match, and error states", async () => {
    mocks.listAdminRequests.mockResolvedValueOnce(
      buildListResponse({ requests: [], total: 0 }),
    );

    const { unmount } = renderRequests();

    expect(await screen.findByText("No requests yet")).toBeInTheDocument();
    unmount();

    mocks.searchParams = new URLSearchParams("search=missing");
    mocks.listAdminRequests.mockResolvedValueOnce(
      buildListResponse({ requests: [], total: 0 }),
    );

    const secondRender = renderRequests();

    expect(await screen.findByText("No matching requests")).toBeInTheDocument();
    secondRender.unmount();

    mocks.searchParams = new URLSearchParams();
    mocks.listAdminRequests.mockRejectedValueOnce(
      new Error("Admin requests unavailable"),
    );

    renderRequests();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Admin requests unavailable")).toBeInTheDocument();
  });
});

function renderRequests() {
  return renderWithQueryClient(<AdminRequestList />);
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
  overrides: Partial<AdminRequestListData & { total: number }> = {},
): AdminRequestListData {
  const requests = overrides.requests ?? [
    buildRequest(),
    buildRequest({
      id: "request-2",
      requestNumber: "REQ-5002",
      title: "Travel approval",
      category: "TRAVEL",
      priority: "MEDIUM",
      status: "PENDING",
      reviewedBy: null,
      reviewedById: null,
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

function buildRequest(overrides: Partial<RequestSummary> = {}): RequestSummary {
  const requester = buildUser({
    id: "employee-1",
    name: "Demo Employee",
    email: "employee@opsflow.demo",
  });
  const reviewer = buildUser({
    id: "manager-1",
    name: "Demo Manager",
    email: "manager@opsflow.demo",
    role: "MANAGER",
  });

  return {
    id: "request-1",
    requestNumber: "REQ-5001",
    title: "Hardware refresh",
    description: "Requesting a replacement laptop for daily work.",
    category: "EQUIPMENT",
    priority: "HIGH",
    status: "APPROVED",
    metadata: null,
    createdById: requester.id,
    reviewedById: reviewer.id,
    reviewNotes: "Approved for replacement cycle.",
    rejectionReason: null,
    submittedAt: "2026-08-13T08:00:00.000Z",
    reviewedAt: "2026-08-13T09:00:00.000Z",
    deletedAt: null,
    createdAt: "2026-08-13T07:00:00.000Z",
    updatedAt: "2026-08-13T09:00:00.000Z",
    createdBy: requester,
    reviewedBy: reviewer,
    ...overrides,
  };
}

function buildUser(overrides: Partial<RequestSummary["createdBy"]> = {}) {
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
