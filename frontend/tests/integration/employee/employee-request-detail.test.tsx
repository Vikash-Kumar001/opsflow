import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EmployeeRequestDetail,
  type EmployeeRequestData,
} from "@/features/employee/requests";
import type {
  RequestCommentData,
  RequestCommentPayload,
  RequestCommentsData,
} from "@/features/shared/comments";
import type { RequestSummary } from "@/features/shared/requests";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  getEmployeeRequest: vi.fn<(id: string) => Promise<EmployeeRequestData>>(),
  submitEmployeeRequest: vi.fn<(id: string) => Promise<EmployeeRequestData>>(),
  cancelEmployeeRequest: vi.fn<(id: string) => Promise<EmployeeRequestData>>(),
  listRequestComments:
    vi.fn<(id: string) => Promise<RequestCommentsData>>(),
  createRequestComment:
    vi.fn<
      (id: string, payload: RequestCommentPayload) => Promise<RequestCommentData>
    >(),
}));

vi.mock("@/features/employee/requests/services/employee-request.service", () => ({
  getEmployeeRequest: mocks.getEmployeeRequest,
  submitEmployeeRequest: mocks.submitEmployeeRequest,
  cancelEmployeeRequest: mocks.cancelEmployeeRequest,
  listEmployeeRequests: vi.fn(),
  createEmployeeRequest: vi.fn(),
  updateEmployeeRequest: vi.fn(),
}));

vi.mock("@/features/shared/comments/services/comment.service", () => ({
  listRequestComments: mocks.listRequestComments,
  createRequestComment: mocks.createRequestComment,
}));

describe("employee request detail", () => {
  beforeEach(() => {
    mocks.getEmployeeRequest.mockReset();
    mocks.submitEmployeeRequest.mockReset();
    mocks.cancelEmployeeRequest.mockReset();
    mocks.listRequestComments.mockReset();
    mocks.createRequestComment.mockReset();
  });

  it("renders own detail, metadata, timeline, review result, and comments", async () => {
    mocks.getEmployeeRequest.mockResolvedValue({
      request: buildRequest({
        status: "REJECTED",
        reviewedAt: "2026-08-13T11:00:00.000Z",
        rejectionReason: "Budget is not available this quarter.",
        reviewedBy: buildUser({ name: "Demo Manager", role: "MANAGER" }),
      }),
    });
    mocks.listRequestComments.mockResolvedValue({
      comments: [
        {
          id: "comment-1",
          requestId: "request-1",
          authorId: "employee-1",
          content: "Adding extra background for the request.",
          createdAt: "2026-08-13T10:00:00.000Z",
          updatedAt: "2026-08-13T10:00:00.000Z",
          author: buildUser(),
        },
      ],
    });

    renderDetail();

    expect((await screen.findAllByText("REQ-3000")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo request").length).toBeGreaterThan(0);
    expect(screen.getByText("Budget is not available this quarter.")).toBeInTheDocument();
    expect(screen.getByText("Request created")).toBeInTheDocument();
    expect(screen.getAllByText("Request rejected").length).toBeGreaterThan(0);
    expect(
      await screen.findByText("Adding extra background for the request."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^submit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^cancel$/i })).not.toBeInTheDocument();
  });

  it("submits a draft request and refreshes action visibility", async () => {
    mocks.getEmployeeRequest.mockResolvedValue({
      request: buildRequest({ status: "DRAFT" }),
    });
    mocks.listRequestComments.mockResolvedValue({ comments: [] });
    mocks.submitEmployeeRequest.mockResolvedValue({
      request: buildRequest({
        status: "PENDING",
        submittedAt: "2026-08-13T12:00:00.000Z",
      }),
    });

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /^submit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^submit request$/i }));

    await waitFor(() => {
      expect(mocks.submitEmployeeRequest).toHaveBeenCalledWith("request-1");
    });
    expect(await screen.findByText("Pending")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^submit$/i })).not.toBeInTheDocument();
  });

  it("cancels an eligible request", async () => {
    mocks.getEmployeeRequest.mockResolvedValue({
      request: buildRequest({ status: "PENDING" }),
    });
    mocks.listRequestComments.mockResolvedValue({ comments: [] });
    mocks.cancelEmployeeRequest.mockResolvedValue({
      request: buildRequest({ status: "CANCELLED" }),
    });

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /^cancel$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^cancel request$/i }));

    await waitFor(() => {
      expect(mocks.cancelEmployeeRequest).toHaveBeenCalledWith("request-1");
    });
    expect(await screen.findByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Request cancelled")).toBeInTheDocument();
  });

  it("adds a comment and refreshes comments", async () => {
    mocks.getEmployeeRequest.mockResolvedValue({
      request: buildRequest({ status: "PENDING" }),
    });
    mocks.listRequestComments
      .mockResolvedValueOnce({ comments: [] })
      .mockResolvedValueOnce({
        comments: [
          {
            id: "comment-new",
            requestId: "request-1",
            authorId: "employee-1",
            content: "Please include this extra detail.",
            createdAt: "2026-08-13T12:30:00.000Z",
            updatedAt: "2026-08-13T12:30:00.000Z",
            author: buildUser(),
          },
        ],
      })
      .mockResolvedValue({
        comments: [
          {
            id: "comment-new",
            requestId: "request-1",
            authorId: "employee-1",
            content: "Please include this extra detail.",
            createdAt: "2026-08-13T12:30:00.000Z",
            updatedAt: "2026-08-13T12:30:00.000Z",
            author: buildUser(),
          },
        ],
      });
    mocks.createRequestComment.mockResolvedValue({
      comment: {
        id: "comment-new",
        requestId: "request-1",
        authorId: "employee-1",
        content: "Please include this extra detail.",
        createdAt: "2026-08-13T12:30:00.000Z",
        updatedAt: "2026-08-13T12:30:00.000Z",
        author: buildUser(),
      },
    });

    renderDetail();

    fireEvent.change(await screen.findByLabelText("Add comment"), {
      target: { value: "Please include this extra detail." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add comment$/i }));

    await waitFor(() => {
      expect(mocks.createRequestComment).toHaveBeenCalledWith(
        "request-1",
        { content: "Please include this extra detail." },
      );
    });
    expect(
      await screen.findByText("Please include this extra detail."),
    ).toBeInTheDocument();
  });

  it("refreshes and explains stale workflow conflicts", async () => {
    mocks.getEmployeeRequest
      .mockResolvedValueOnce({ request: buildRequest({ status: "DRAFT" }) })
      .mockResolvedValueOnce({ request: buildRequest({ status: "PENDING" }) });
    mocks.listRequestComments.mockResolvedValue({ comments: [] });
    mocks.submitEmployeeRequest.mockRejectedValue(
      new ApiError({
        status: 409,
        code: "INVALID_TRANSITION",
        message: "Cannot submit request in PENDING status.",
      }),
    );

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /^submit$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^submit request$/i }));

    expect(
      await screen.findByText("Request state refreshed"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.getEmployeeRequest).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Pending")).toBeInTheDocument();
  });

  it("renders privacy-preserving not found state", async () => {
    mocks.getEmployeeRequest.mockRejectedValue(
      new ApiError({
        status: 404,
        code: "NOT_FOUND",
        message: "Request not found",
      }),
    );
    mocks.listRequestComments.mockResolvedValue({ comments: [] });

    renderDetail();

    expect(await screen.findByText("Request not found")).toBeInTheDocument();
    expect(
      screen.getByText("This request does not exist, was removed, or is private."),
    ).toBeInTheDocument();
  });
});

function renderDetail() {
  return renderWithQueryClient(<EmployeeRequestDetail requestId="request-1" />);
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
  return {
    id: "request-1",
    requestNumber: "REQ-3000",
    title: "Demo request",
    description: "Demo employee request description.",
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
    createdBy: buildUser(),
    reviewedBy: null,
    ...overrides,
  };
}

function buildUser(
  overrides: Partial<RequestSummary["createdBy"]> = {},
): RequestSummary["createdBy"] {
  return {
    id: "employee-1",
    name: "Demo Employee",
    email: "employee@opsflow.demo",
    role: "EMPLOYEE",
    isActive: true,
    managerId: "manager-1",
    createdAt: "2026-08-13T07:00:00.000Z",
    updatedAt: "2026-08-13T07:00:00.000Z",
    ...overrides,
  };
}
