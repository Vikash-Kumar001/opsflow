import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CreateRequestForm,
  EditRequestForm,
  type EmployeeRequestData,
  type EmployeeRequestFormPayload,
} from "@/features/employee/requests";
import type { RequestSummary } from "@/features/shared/requests";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  push: vi.fn<(path: string) => void>(),
  createEmployeeRequest:
    vi.fn<(payload: EmployeeRequestFormPayload) => Promise<EmployeeRequestData>>(),
  updateEmployeeRequest:
    vi.fn<
      (id: string, payload: EmployeeRequestFormPayload) => Promise<EmployeeRequestData>
    >(),
  getEmployeeRequest: vi.fn<(id: string) => Promise<EmployeeRequestData>>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/features/employee/requests/services/employee-request.service", () => ({
  createEmployeeRequest: mocks.createEmployeeRequest,
  updateEmployeeRequest: mocks.updateEmployeeRequest,
  getEmployeeRequest: mocks.getEmployeeRequest,
  listEmployeeRequests: vi.fn(),
}));

describe("employee request forms", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.createEmployeeRequest.mockReset();
    mocks.updateEmployeeRequest.mockReset();
    mocks.getEmployeeRequest.mockReset();
  });

  it("shows required field validation before creating", async () => {
    renderWithQueryClient(<CreateRequestForm />);

    fireEvent.click(screen.getByRole("button", { name: /^create request$/i }));

    expect(
      await screen.findByText("Title must be at least 3 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Description must be at least 10 characters"),
    ).toBeInTheDocument();
    expect(mocks.createEmployeeRequest).not.toHaveBeenCalled();
  });

  it("creates a request without protected fields and navigates to detail", async () => {
    const request = buildRequest({ id: "request-created" });
    mocks.createEmployeeRequest.mockResolvedValue({ request });
    renderWithQueryClient(<CreateRequestForm />);

    fillRequestForm({
      title: "GitHub Copilot access",
      description: "Please enable Copilot for frontend delivery work.",
      category: "SOFTWARE_ACCESS",
      priority: "HIGH",
    });
    fireEvent.click(screen.getByRole("button", { name: /^create request$/i }));

    await waitFor(() => {
      expect(mocks.createEmployeeRequest).toHaveBeenCalledWith({
        title: "GitHub Copilot access",
        description: "Please enable Copilot for frontend delivery work.",
        category: "SOFTWARE_ACCESS",
        priority: "HIGH",
      });
    });
    expect(mocks.createEmployeeRequest.mock.calls[0][0]).not.toHaveProperty("status");
    expect(mocks.createEmployeeRequest.mock.calls[0][0]).not.toHaveProperty(
      "createdById",
    );
    expect(mocks.push).toHaveBeenCalledWith("/employee/requests/request-created");
  });

  it("maps backend validation errors to fields", async () => {
    mocks.createEmployeeRequest.mockRejectedValue(
      new ApiError({
        status: 400,
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        details: [
          {
            path: ["title"],
            message: "Title must be 160 characters or fewer",
          },
        ],
      }),
    );
    renderWithQueryClient(<CreateRequestForm />);

    fillRequestForm({
      title: "Valid title",
      description: "This description is long enough.",
    });
    fireEvent.click(screen.getByRole("button", { name: /^create request$/i }));

    expect(
      await screen.findByText("Please fix the highlighted fields."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Title must be 160 characters or fewer"),
    ).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("prevents double-submit while create is pending", async () => {
    let resolveCreate!: (value: EmployeeRequestData) => void;
    mocks.createEmployeeRequest.mockReturnValue(
      new Promise<EmployeeRequestData>((resolve) => {
        resolveCreate = resolve;
      }),
    );
    renderWithQueryClient(<CreateRequestForm />);

    fillRequestForm({
      title: "Travel approval",
      description: "I need approval for client-site travel next week.",
    });
    fireEvent.click(screen.getByRole("button", { name: /^create request$/i }));

    expect(
      await screen.findByRole("button", { name: /creating/i }),
    ).toBeDisabled();

    resolveCreate({ request: buildRequest({ id: "request-pending" }) });

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/employee/requests/request-pending");
    });
  });

  it("updates an eligible draft request", async () => {
    const request = buildRequest({
      id: "request-editable",
      requestNumber: "REQ-2001",
      title: "Old title",
      description: "Old request description.",
      status: "DRAFT",
    });
    mocks.getEmployeeRequest.mockResolvedValue({ request });
    mocks.updateEmployeeRequest.mockResolvedValue({
      request: buildRequest({ ...request, title: "Updated title" }),
    });
    renderWithQueryClient(<EditRequestForm requestId="request-editable" />);

    expect(await screen.findByDisplayValue("Old title")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save changes$/i }));

    await waitFor(() => {
      expect(mocks.updateEmployeeRequest).toHaveBeenCalledWith(
        "request-editable",
        {
          title: "Updated title",
          description: "Old request description.",
          category: "OTHER",
          priority: "MEDIUM",
        },
      );
    });
    expect(
      await screen.findByText("Request updated"),
    ).toBeInTheDocument();
  });

  it("blocks editing for ineligible request statuses", async () => {
    mocks.getEmployeeRequest.mockResolvedValue({
      request: buildRequest({
        id: "request-approved",
        requestNumber: "REQ-2002",
        status: "APPROVED",
      }),
    });

    renderWithQueryClient(<EditRequestForm requestId="request-approved" />);

    expect(
      await screen.findByText("This request cannot be edited"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^save changes$/i })).not.toBeInTheDocument();
    expect(mocks.updateEmployeeRequest).not.toHaveBeenCalled();
  });
});

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

function fillRequestForm(values: Partial<EmployeeRequestFormPayload>) {
  if (values.title !== undefined) {
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: values.title },
    });
  }

  if (values.description !== undefined) {
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: values.description },
    });
  }

  if (values.category !== undefined) {
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: values.category },
    });
  }

  if (values.priority !== undefined) {
    fireEvent.change(screen.getByLabelText("Priority"), {
      target: { value: values.priority },
    });
  }
}

function buildRequest(overrides: Partial<RequestSummary> = {}): RequestSummary {
  return {
    id: "request-1",
    requestNumber: "REQ-2000",
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
