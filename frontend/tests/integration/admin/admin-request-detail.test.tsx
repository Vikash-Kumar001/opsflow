import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminRequestDetail } from "@/features/admin/requests";
import type { AdminRequestData } from "@/features/admin/requests";
import type {
  RequestCommentData,
  RequestCommentPayload,
  RequestCommentsData,
} from "@/features/shared/comments";
import type { RequestSummary } from "@/features/shared/requests";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  push: vi.fn<(path: string) => void>(),
  getAdminRequest: vi.fn<(id: string) => Promise<AdminRequestData>>(),
  deleteAdminRequest: vi.fn<(id: string) => Promise<AdminRequestData>>(),
  listRequestComments:
    vi.fn<(id: string) => Promise<RequestCommentsData>>(),
  createRequestComment:
    vi.fn<
      (id: string, payload: RequestCommentPayload) => Promise<RequestCommentData>
    >(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/features/admin/requests/services/admin-request.service", () => ({
  listAdminRequests: vi.fn(),
  getAdminRequest: mocks.getAdminRequest,
  deleteAdminRequest: mocks.deleteAdminRequest,
}));

vi.mock("@/features/shared/comments/services/comment.service", () => ({
  listRequestComments: mocks.listRequestComments,
  createRequestComment: mocks.createRequestComment,
}));

describe("admin request detail", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.getAdminRequest.mockReset();
    mocks.deleteAdminRequest.mockReset();
    mocks.listRequestComments.mockReset();
    mocks.createRequestComment.mockReset();
    mocks.listRequestComments.mockResolvedValue({ comments: [] });
  });

  it("renders organization request detail with requester, reviewer, timeline, and comments", async () => {
    mocks.getAdminRequest.mockResolvedValue({ request: buildRequest() });
    mocks.listRequestComments.mockResolvedValue({
      comments: [
        {
          id: "comment-1",
          requestId: "request-1",
          authorId: "admin-1",
          content: "Confirmed procurement history is preserved.",
          createdAt: "2026-08-13T10:00:00.000Z",
          updatedAt: "2026-08-13T10:00:00.000Z",
          author: buildUser({
            id: "admin-1",
            name: "Demo Admin",
            email: "admin@opsflow.demo",
            role: "ADMIN",
          }),
        },
      ],
    });

    renderDetail();

    expect((await screen.findAllByText("REQ-6001")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getAllByText("Demo Employee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo Manager").length).toBeGreaterThan(0);
    expect(screen.getByText("Request approved")).toBeInTheDocument();
    expect(
      await screen.findByText("Confirmed procurement history is preserved."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^approve$/i })).not.toBeInTheDocument();
  });

  it("archives a request and returns to the Admin request list", async () => {
    const request = buildRequest();
    mocks.getAdminRequest.mockResolvedValue({ request });
    mocks.deleteAdminRequest.mockResolvedValue({
      request: { ...request, deletedAt: "2026-08-13T10:00:00.000Z" },
    });

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Archive request" }));

    await waitFor(() => {
      expect(mocks.deleteAdminRequest).toHaveBeenCalledWith("request-1");
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin/requests");
  });

  it("renders archive errors without navigating away", async () => {
    mocks.getAdminRequest.mockResolvedValue({ request: buildRequest() });
    mocks.deleteAdminRequest.mockRejectedValue(
      new ApiError({
        status: 404,
        code: "NOT_FOUND",
        message: "Request not found",
      }),
    );

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Archive request" }));

    expect(await screen.findAllByText("Request not found")).toHaveLength(2);
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("renders not-found state for unavailable requests", async () => {
    mocks.getAdminRequest.mockRejectedValue(
      new ApiError({
        status: 404,
        code: "NOT_FOUND",
        message: "Request not found",
      }),
    );

    renderDetail();

    expect(await screen.findByText("Request not found")).toBeInTheDocument();
    expect(
      screen.getByText(/does not exist, was archived, or is unavailable/i),
    ).toBeInTheDocument();
  });
});

function renderDetail() {
  return renderWithQueryClient(<AdminRequestDetail requestId="request-1" />);
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
    requestNumber: "REQ-6001",
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
