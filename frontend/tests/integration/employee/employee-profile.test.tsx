import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmployeeProfile } from "@/features/employee/profile";
import type { AuthUser } from "@/features/auth/types/auth.types";

const mocks = vi.hoisted(() => ({
  currentUser: null as AuthUser | null,
  error: null as Error | null,
  isError: false,
  isLoading: false,
  refetch: vi.fn(),
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    data: mocks.currentUser,
    error: mocks.error,
    isError: mocks.isError,
    isLoading: mocks.isLoading,
    refetch: mocks.refetch,
  }),
}));

describe("employee profile", () => {
  beforeEach(() => {
    mocks.currentUser = buildEmployee();
    mocks.error = null;
    mocks.isError = false;
    mocks.isLoading = false;
    mocks.refetch.mockReset();
  });

  it("renders the current employee profile", () => {
    render(<EmployeeProfile />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getAllByText("Demo Employee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("employee@opsflow.demo").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Employee request access")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My requests" })).toHaveAttribute(
      "href",
      "/employee/requests",
    );
  });

  it("renders a loading state while the current user is pending", () => {
    mocks.currentUser = null;
    mocks.isLoading = true;

    render(<EmployeeProfile />);

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading employee profile")).toBeInTheDocument();
  });

  it("renders an error state when current-user lookup fails", () => {
    mocks.currentUser = null;
    mocks.error = new Error("Unable to load profile");
    mocks.isError = true;

    render(<EmployeeProfile />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Unable to load profile")).toBeInTheDocument();
  });
});

function buildEmployee(): AuthUser {
  return {
    id: "employee-1",
    name: "Demo Employee",
    email: "employee@opsflow.demo",
    role: "EMPLOYEE",
    isActive: true,
    managerId: "manager-1",
    createdAt: "2026-08-13T07:00:00.000Z",
    updatedAt: "2026-08-13T07:00:00.000Z",
  };
}
