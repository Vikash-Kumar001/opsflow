import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmployeeRequestList } from "@/features/employee/requests";
import type {
  EmployeeRequestListData,
  EmployeeRequestListParams,
} from "@/features/employee/requests";
import type { RequestSummary } from "@/features/shared/requests";

const mocks = vi.hoisted(() => ({
  pathname: "/employee/requests",
  searchParams: new URLSearchParams(),
  replace: vi.fn<(path: string) => void>(),
  listEmployeeRequests:
    vi.fn<(params: EmployeeRequestListParams) => Promise<EmployeeRequestListData>>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/employee/requests/services/employee-request.service", () => ({
  listEmployeeRequests: mocks.listEmployeeRequests,
}));

describe("employee request list", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.pathname = "/employee/requests";
    mocks.searchParams = new URLSearchParams();
    mocks.replace.mockReset();
    mocks.listEmployeeRequests.mockReset();
  });

  it("renders loading, data, responsive cards, and valid row actions", async () => {
    mocks.listEmployeeRequests.mockResolvedValue(buildListResponse());

    renderRequestList();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(await screen.findByText("My requests")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "My requests" })).toBeInTheDocument();
    expect(screen.getAllByText("Draft laptop request").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending software request").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Submit REQ-1001")).toHaveLength(2);
    expect(screen.getAllByLabelText("Cancel REQ-1001")).toHaveLength(2);
    expect(screen.getAllByLabelText("Cancel REQ-1002")).toHaveLength(2);
    expect(screen.queryByLabelText("Submit REQ-1002")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1-2 of 12")).toBeInTheDocument();
  });

  it("passes URL query params to the server-backed list request", async () => {
    mocks.searchParams = new URLSearchParams(
      "search=laptop&status=PENDING&category=EQUIPMENT&priority=HIGH&page=2&sortBy=title&sortDirection=asc",
    );
    mocks.listEmployeeRequests.mockResolvedValue(buildListResponse());

    renderRequestList();

    await waitFor(() => {
      expect(mocks.listEmployeeRequests).toHaveBeenCalledWith({
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

  it("debounces search for the server request without updating URL state", async () => {
    mocks.listEmployeeRequests.mockResolvedValue(buildListResponse());

    renderRequestList();

    const searchInput = await screen.findByLabelText("Search my requests");
    fireEvent.change(searchInput, { target: { value: "travel" } });

    expect(mocks.replace).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mocks.listEmployeeRequests).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "travel" }),
      );
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("updates URL state for filters, clear filters, and pagination", async () => {
    mocks.searchParams = new URLSearchParams("search=laptop&page=2");
    mocks.listEmployeeRequests.mockResolvedValue(
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

    renderRequestList();

    await screen.findByText("My requests");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/employee/requests?page=3",
    );

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "APPROVED" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/employee/requests?status=APPROVED",
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/employee/requests");
  });

  it("renders no-data, no-match, and error states", async () => {
    mocks.listEmployeeRequests.mockResolvedValueOnce(
      buildListResponse({ requests: [], total: 0 }),
    );

    const { unmount } = renderRequestList();

    expect(await screen.findByText("No requests yet")).toBeInTheDocument();
    unmount();

    mocks.searchParams = new URLSearchParams("search=missing");
    mocks.listEmployeeRequests.mockResolvedValueOnce(
      buildListResponse({ requests: [], total: 0 }),
    );

    const secondRender = renderRequestList();

    expect(await screen.findByText("No matching requests")).toBeInTheDocument();
    secondRender.unmount();

    mocks.searchParams = new URLSearchParams();
    mocks.listEmployeeRequests.mockRejectedValueOnce(
      new Error("Request list unavailable"),
    );

    renderRequestList();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Request list unavailable")).toBeInTheDocument();
  });
});

function renderRequestList() {
  return renderWithQueryClient(<EmployeeRequestList />);
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
  overrides: Partial<EmployeeRequestListData & { total: number }> = {},
): EmployeeRequestListData {
  const requests = overrides.requests ?? [
    buildRequest({
      id: "request-1",
      requestNumber: "REQ-1001",
      title: "Draft laptop request",
      status: "DRAFT",
      category: "EQUIPMENT",
      priority: "HIGH",
    }),
    buildRequest({
      id: "request-2",
      requestNumber: "REQ-1002",
      title: "Pending software request",
      status: "PENDING",
      category: "SOFTWARE_ACCESS",
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

function buildRequest(overrides: Partial<RequestSummary>): RequestSummary {
  return {
    id: "request-1",
    requestNumber: "REQ-1000",
    title: "Demo request",
    description: "Demo employee request.",
    category: "OTHER",
    priority: "MEDIUM",
    status: "DRAFT",
    metadata: null,
    createdById: "employee-1",
    reviewedById: null,
    reviewNotes: null,
    rejectionReason: null,
    submittedAt: null,
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
    ...overrides,
  };
}
