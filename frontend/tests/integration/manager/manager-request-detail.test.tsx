import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ManagerRequestDetail,
  type ManagerRejectRequestPayload,
  type ManagerReviewNotesPayload,
  type TeamRequest,
  type TeamRequestData,
} from "@/features/manager/requests";
import type {
  RequestCommentData,
  RequestCommentPayload,
  RequestCommentsData,
} from "@/features/shared/comments";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  getTeamRequest: vi.fn<(id: string) => Promise<TeamRequestData>>(),
  startTeamRequestReview:
    vi.fn<(id: string, payload: ManagerReviewNotesPayload) => Promise<TeamRequestData>>(),
  approveTeamRequest:
    vi.fn<(id: string, payload: ManagerReviewNotesPayload) => Promise<TeamRequestData>>(),
  rejectTeamRequest:
    vi.fn<(id: string, payload: ManagerRejectRequestPayload) => Promise<TeamRequestData>>(),
  listRequestComments:
    vi.fn<(id: string) => Promise<RequestCommentsData>>(),
  createRequestComment:
    vi.fn<
      (id: string, payload: RequestCommentPayload) => Promise<RequestCommentData>
    >(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/features/manager/requests/services/manager-request.service", () => ({
  getTeamRequest: mocks.getTeamRequest,
  startTeamRequestReview: mocks.startTeamRequestReview,
  approveTeamRequest: mocks.approveTeamRequest,
  rejectTeamRequest: mocks.rejectTeamRequest,
  listTeamRequests: vi.fn(),
}));

vi.mock("@/features/shared/comments/services/comment.service", () => ({
  listRequestComments: mocks.listRequestComments,
  createRequestComment: mocks.createRequestComment,
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

describe("manager request detail", () => {
  beforeEach(() => {
    mocks.getTeamRequest.mockReset();
    mocks.startTeamRequestReview.mockReset();
    mocks.approveTeamRequest.mockReset();
    mocks.rejectTeamRequest.mockReset();
    mocks.listRequestComments.mockReset();
    mocks.createRequestComment.mockReset();
    mocks.getCurrentUser.mockReset();
    mocks.getCurrentUser.mockResolvedValue(buildUser({ id: "manager-1" }));
    mocks.listRequestComments.mockResolvedValue({ comments: [] });
  });

  it("renders team request detail, requester context, timeline, and comments", async () => {
    mocks.getTeamRequest.mockResolvedValue({
      request: buildTeamRequest({
        status: "IN_REVIEW",
        reviewNotes: "Checking budget and equipment stock.",
        reviewer: buildUser({ id: "manager-1", name: "Demo Manager", role: "MANAGER" }),
      }),
    });
    mocks.listRequestComments.mockResolvedValue({
      comments: [
        {
          id: "comment-1",
          requestId: "request-1",
          authorId: "employee-1",
          content: "The laptop is failing during builds.",
          createdAt: "2026-08-13T10:00:00.000Z",
          updatedAt: "2026-08-13T10:00:00.000Z",
          author: buildUser(),
        },
      ],
    });

    renderDetail();

    expect((await screen.findAllByText("REQ-4000")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hardware refresh").length).toBeGreaterThan(0);
    expect(screen.getByText("Requester")).toBeInTheDocument();
    expect(screen.getAllByText("Demo Employee").length).toBeGreaterThan(0);
    expect(screen.getByText("Review started")).toBeInTheDocument();
    expect(screen.getByText("Checking budget and equipment stock.")).toBeInTheDocument();
    expect(
      await screen.findByText("The laptop is failing during builds."),
    ).toBeInTheDocument();
  });

  it("starts review and approves with optional notes", async () => {
    mocks.getTeamRequest
      .mockResolvedValueOnce({ request: buildTeamRequest({ status: "PENDING" }) })
      .mockResolvedValue({ request: buildTeamRequest({ status: "IN_REVIEW" }) });
    mocks.startTeamRequestReview.mockResolvedValue({
      request: buildTeamRequest({ status: "IN_REVIEW" }),
    });
    mocks.approveTeamRequest.mockResolvedValue({
      request: buildTeamRequest({ status: "APPROVED" }),
    });

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /start review/i }));
    fireEvent.change(screen.getByLabelText("Review notes"), {
      target: { value: "Initial review started." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^start review$/i }));

    await waitFor(() => {
      expect(mocks.startTeamRequestReview).toHaveBeenCalledWith("request-1", {
        reviewNotes: "Initial review started.",
      });
    });

    fireEvent.click(await screen.findByRole("button", { name: /^approve$/i }));
    fireEvent.change(screen.getByLabelText("Review notes"), {
      target: { value: "Approved for replacement." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^approve request$/i }));

    await waitFor(() => {
      expect(mocks.approveTeamRequest).toHaveBeenCalledWith("request-1", {
        reviewNotes: "Approved for replacement.",
      });
    });
  });

  it("requires a rejection reason before rejecting", async () => {
    mocks.getTeamRequest.mockResolvedValue({
      request: buildTeamRequest({ status: "IN_REVIEW" }),
    });
    mocks.rejectTeamRequest.mockResolvedValue({
      request: buildTeamRequest({ status: "REJECTED" }),
    });

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /^reject$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^reject request$/i }));

    expect(await screen.findByText("Rejection reason is required")).toBeInTheDocument();
    expect(mocks.rejectTeamRequest).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Rejection reason"), {
      target: { value: "Not enough budget this quarter." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^reject request$/i }));

    await waitFor(() => {
      expect(mocks.rejectTeamRequest).toHaveBeenCalledWith("request-1", {
        rejectionReason: "Not enough budget this quarter.",
      });
    });
  });

  it("refreshes and explains stale workflow conflicts", async () => {
    mocks.getTeamRequest
      .mockResolvedValueOnce({ request: buildTeamRequest({ status: "IN_REVIEW" }) })
      .mockResolvedValue({ request: buildTeamRequest({ status: "APPROVED" }) });
    mocks.approveTeamRequest.mockRejectedValue(
      new ApiError({
        status: 409,
        code: "INVALID_TRANSITION",
        message: "Cannot approve request in APPROVED status.",
      }),
    );

    renderDetail();

    fireEvent.click(await screen.findByRole("button", { name: /^approve$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^approve request$/i }));

    expect(
      await screen.findByText("Request state refreshed"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.getTeamRequest).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Approved")).toBeInTheDocument();
  });

  it("hides approval actions for self-owned requests", async () => {
    mocks.getCurrentUser.mockResolvedValue(buildUser({ id: "manager-1" }));
    mocks.getTeamRequest.mockResolvedValue({
      request: buildTeamRequest({
        status: "IN_REVIEW",
        requester: buildUser({
          id: "manager-1",
          name: "Demo Manager",
          email: "manager@opsflow.demo",
          role: "MANAGER",
        }),
      }),
    });

    renderDetail();

    expect(await screen.findByText("Requester-owned request")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^approve$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^reject$/i })).not.toBeInTheDocument();
  });

  it("renders privacy-preserving not found state", async () => {
    mocks.getTeamRequest.mockRejectedValue(
      new ApiError({
        status: 404,
        code: "NOT_FOUND",
        message: "Request not found",
      }),
    );

    renderDetail();

    expect(await screen.findByText("Request not found")).toBeInTheDocument();
    expect(
      screen.getByText("This team request does not exist, was removed, or is private."),
    ).toBeInTheDocument();
  });
});

function renderDetail() {
  return renderWithQueryClient(<ManagerRequestDetail requestId="request-1" />);
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

function buildTeamRequest(overrides: Partial<TeamRequest> = {}): TeamRequest {
  return {
    id: "request-1",
    requestNumber: "REQ-4000",
    title: "Hardware refresh",
    description: "Requesting a replacement laptop for daily work.",
    category: "EQUIPMENT",
    priority: "HIGH",
    status: "PENDING",
    reviewNotes: null,
    rejectionReason: null,
    submittedAt: "2026-08-13T09:00:00.000Z",
    reviewedAt: null,
    createdAt: "2026-08-13T08:00:00.000Z",
    updatedAt: "2026-08-13T09:00:00.000Z",
    requester: buildUser(),
    reviewer: null,
    ...overrides,
  };
}

function buildUser(
  overrides: Partial<TeamRequest["requester"]> = {},
): TeamRequest["requester"] {
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
