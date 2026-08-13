import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedAppLayout } from "@/components/layout/protected/protected-app-layout";
import type { AuthUser } from "@/features/auth/types/auth.types";

const mocks = vi.hoisted(() => ({
  currentUser: null as AuthUser | null,
  isLoading: false,
  pathname: "/admin/dashboard",
  replace: vi.fn<(path: string) => void>(),
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    data: mocks.currentUser,
    isLoading: mocks.isLoading,
  }),
}));

vi.mock("@/features/auth/hooks/use-logout", () => ({
  useLogout: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

const employeeUser: AuthUser = {
  id: "employee-1",
  name: "Demo Employee",
  email: "employee@opsflow.demo",
  role: "EMPLOYEE",
  isActive: true,
  managerId: "manager-1",
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("protected app layout", () => {
  beforeEach(() => {
    mocks.currentUser = employeeUser;
    mocks.isLoading = false;
    mocks.pathname = "/admin/dashboard";
    mocks.replace.mockReset();
  });

  it("redirects manual unauthorized role-area navigation to forbidden", async () => {
    renderProtectedLayout(<p>Admin content</p>);

    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/forbidden");
    });
  });

  it("redirects unauthenticated users to login with a safe return URL", async () => {
    mocks.currentUser = null;
    mocks.pathname = "/employee/requests";

    renderProtectedLayout(<p>Employee content</p>);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        "/login?returnTo=%2Femployee%2Frequests",
      );
    });
  });

  it("renders authorized role-area content without privileged flicker", () => {
    mocks.pathname = "/employee/dashboard";

    renderProtectedLayout(<p>Employee content</p>);

    expect(screen.getByText("Employee content")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
  });
});

function renderProtectedLayout(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProtectedAppLayout>{children}</ProtectedAppLayout>
    </QueryClientProvider>,
  );
}
