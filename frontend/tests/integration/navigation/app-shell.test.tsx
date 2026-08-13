import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell/app-shell";
import type { AuthUser } from "@/features/auth/types/auth.types";

const mocks = vi.hoisted(() => ({
  pathname: "/employee/dashboard",
  replace: vi.fn<(path: string) => void>(),
  changePassword: vi.fn<
    (payload: { currentPassword: string; newPassword: string }) => Promise<AuthUser>
  >(),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  changePassword: mocks.changePassword,
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

const baseUser: AuthUser = {
  id: "user-1",
  name: "Demo User",
  email: "demo@opsflow.demo",
  role: "EMPLOYEE",
  isActive: true,
  managerId: null,
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("app shell navigation", () => {
  beforeEach(() => {
    mocks.pathname = "/employee/dashboard";
    mocks.replace.mockReset();
    mocks.changePassword.mockReset();
  });

  it("does not render Admin navigation for employees", () => {
    renderShell(baseUser);

    expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Audit Logs" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My Requests" })).toBeInTheDocument();
  });

  it("does not render Admin-only navigation for managers", () => {
    renderShell({ ...baseUser, role: "MANAGER" });

    expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Audit Logs" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Team Requests" }),
    ).toBeInTheDocument();
  });

  it("renders Admin navigation for admins", () => {
    mocks.pathname = "/admin/dashboard";
    renderShell({ ...baseUser, role: "ADMIN" });

    expect(screen.getByRole("link", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Audit Logs" })).toBeInTheDocument();
  });

  it("renders mobile navigation trigger", () => {
    renderShell(baseUser);

    expect(
      screen.getByRole("button", { name: "Open navigation" }),
    ).toBeInTheDocument();
  });

  it("opens password change from the user menu for any role", async () => {
    mocks.changePassword.mockResolvedValue(baseUser);
    renderShell(baseUser);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));
    fireEvent.click(screen.getByText("Change password"));

    expect(
      screen.getByRole("heading", { name: "Change password" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "Employee@123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "Employee@456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Employee@456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^change password$/i }));

    await waitFor(() => {
      expect(mocks.changePassword).toHaveBeenCalledWith({
        currentPassword: "Employee@123",
        newPassword: "Employee@456",
      });
    });
    expect(await screen.findByText("Password updated")).toBeInTheDocument();
  });
});

function renderShell(user: AuthUser) {
  return renderWithQueryClient(
    <AppShell user={user}>
      <p>Protected content</p>
    </AppShell>,
  );
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
