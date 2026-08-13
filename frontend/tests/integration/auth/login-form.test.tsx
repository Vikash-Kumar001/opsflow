import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { LoginForm } from "@/features/auth/components/login-form";
import type { AuthUser, LoginRequest } from "@/features/auth/types/auth.types";

const mocks = vi.hoisted(() => ({
  login: vi.fn<(payload: LoginRequest) => Promise<AuthUser>>(),
  replace: vi.fn<(path: string) => void>(),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  login: (payload: LoginRequest) => mocks.login(payload),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

const managerUser: AuthUser = {
  id: "manager-1",
  name: "Demo Manager",
  email: "manager@opsflow.demo",
  role: "MANAGER",
  isActive: true,
  managerId: null,
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("login form", () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.replace.mockReset();
  });

  it("shows accessible validation errors", async () => {
    renderLoginForm();

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("shows invalid credential errors from the backend", async () => {
    mocks.login.mockRejectedValue(
      new ApiError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      }),
    );
    renderLoginForm();

    fillLoginForm("manager@opsflow.demo", "wrong-password");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByText("Unable to sign in")).toBeInTheDocument();
    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects successful manager login to the manager dashboard", async () => {
    mocks.login.mockResolvedValue(managerUser);
    renderLoginForm();

    fillLoginForm("manager@opsflow.demo", "Manager@123");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/manager/dashboard");
    });
  });

  it("shows a pending state while login is in flight", async () => {
    let resolveLogin!: (user: AuthUser) => void;
    mocks.login.mockReturnValue(
      new Promise<AuthUser>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    renderLoginForm();

    fillLoginForm("manager@opsflow.demo", "Manager@123");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByRole("button", { name: /signing in/i }),
    ).toBeDisabled();

    resolveLogin(managerUser);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/manager/dashboard");
    });
  });
});

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm returnTo={null} />
    </QueryClientProvider>,
  );
}

function fillLoginForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
}
