import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserList } from "@/features/admin/users";
import type {
  AdminUser,
  AdminUserData,
  AdminUserListData,
  AdminUserListParams,
  ChangeAdminUserRolePayload,
  ChangeAdminUserStatusPayload,
  CreateAdminUserPayload,
} from "@/features/admin/users/types/admin-user.types";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  pathname: "/admin/users",
  searchParams: new URLSearchParams(),
  replace: vi.fn<(path: string) => void>(),
  listAdminUsers:
    vi.fn<(params: AdminUserListParams) => Promise<AdminUserListData>>(),
  createAdminUser:
    vi.fn<(payload: CreateAdminUserPayload) => Promise<AdminUserData>>(),
  changeAdminUserRole:
    vi.fn<(payload: ChangeAdminUserRolePayload) => Promise<AdminUserData>>(),
  changeAdminUserStatus:
    vi.fn<(payload: ChangeAdminUserStatusPayload) => Promise<AdminUserData>>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/admin/users/services/admin-user.service", () => ({
  listAdminUsers: mocks.listAdminUsers,
  createAdminUser: mocks.createAdminUser,
  changeAdminUserRole: mocks.changeAdminUserRole,
  changeAdminUserStatus: mocks.changeAdminUserStatus,
}));

describe("admin user list", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.pathname = "/admin/users";
    mocks.searchParams = new URLSearchParams();
    mocks.replace.mockReset();
    mocks.listAdminUsers.mockReset();
    mocks.createAdminUser.mockReset();
    mocks.changeAdminUserRole.mockReset();
    mocks.changeAdminUserStatus.mockReset();
  });

  it("renders loading, users, role/status badges, and responsive actions", async () => {
    mocks.listAdminUsers.mockResolvedValue(buildListResponse());

    renderUsers();

    expect(screen.getByLabelText("Loading page header")).toBeInTheDocument();
    expect(await screen.findByText("Users")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Admin users" })).toBeInTheDocument();
    expect(screen.getAllByText("Demo Admin").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@opsflow.demo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Change role for admin@opsflow.demo")).toHaveLength(2);
    expect(screen.getAllByLabelText("Deactivate admin@opsflow.demo")).toHaveLength(2);
    expect(screen.queryByText("Manager dashboard")).not.toBeInTheDocument();
  });

  it("passes URL query params to the server-backed user list request", async () => {
    mocks.searchParams = new URLSearchParams(
      "search=demo&role=MANAGER&status=active&page=2&limit=25",
    );
    mocks.listAdminUsers.mockResolvedValue(buildListResponse());

    renderUsers();

    await waitFor(() => {
      expect(mocks.listAdminUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
        search: "demo",
        role: "MANAGER",
        status: "active",
      });
    });
  });

  it("updates URL state for filters, reset, and pagination without persisting search text", async () => {
    mocks.searchParams = new URLSearchParams("search=demo&page=2");
    mocks.listAdminUsers.mockResolvedValue(
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

    renderUsers();

    await screen.findByText("Users");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/users?page=3",
    );

    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "EMPLOYEE" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/users?role=EMPLOYEE",
    );

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "inactive" },
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/admin/users?status=inactive",
    );

    const replaceCallCount = mocks.replace.mock.calls.length;
    fireEvent.change(screen.getByLabelText("Search users"), {
      target: { value: "manager" },
    });

    await waitFor(() => {
      expect(mocks.listAdminUsers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: "manager" }),
      );
    });
    expect(mocks.replace).toHaveBeenCalledTimes(replaceCallCount);

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/admin/users");
  });

  it("creates a user through the dialog form", async () => {
    mocks.listAdminUsers.mockResolvedValue(buildListResponse());
    mocks.createAdminUser.mockResolvedValue({
      user: buildUser({
        id: "new-user",
        name: "Priya Shah",
        email: "priya@opsflow.demo",
        role: "EMPLOYEE",
      }),
    });

    renderUsers();

    fireEvent.click(await screen.findByRole("button", { name: "Create user" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Priya Shah" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "priya@opsflow.demo" },
    });
    fireEvent.change(screen.getByLabelText("Temporary password"), {
      target: { value: "Employee@123" },
    });
    clickLastButton("Create user");

    await waitFor(() => {
      expect(mocks.createAdminUser).toHaveBeenCalledWith({
        name: "Priya Shah",
        email: "priya@opsflow.demo",
        password: "Employee@123",
        role: "EMPLOYEE",
        isActive: true,
      });
    });
    expect(await screen.findByText("Created priya@opsflow.demo.")).toBeInTheDocument();
  });

  it("sends a role change request and shows the old/new role confirmation", async () => {
    mocks.listAdminUsers.mockResolvedValue(buildListResponse());
    mocks.changeAdminUserRole.mockResolvedValue({
      user: buildUser({ id: "employee-1", role: "MANAGER" }),
    });

    renderUsers();

    fireEvent.click(
      (await screen.findAllByLabelText("Change role for employee@opsflow.demo"))[0],
    );
    expect(
      screen.getByText(/Change Demo Employee from Employee to Employee/i),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New role"), {
      target: { value: "MANAGER" },
    });
    expect(
      screen.getByText(/Change Demo Employee from Employee to Manager/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change role" }));

    await waitFor(() => {
      expect(mocks.changeAdminUserRole).toHaveBeenCalledWith({
        id: "employee-1",
        role: "MANAGER",
      });
    });
  });

  it("sends a deactivate request and renders backend safeguard errors", async () => {
    mocks.listAdminUsers.mockResolvedValue(buildListResponse());
    mocks.changeAdminUserStatus.mockRejectedValue(
      new ApiError({
        status: 403,
        code: "FORBIDDEN",
        message: "Admins cannot deactivate themselves",
      }),
    );

    renderUsers();

    fireEvent.click(
      (await screen.findAllByLabelText("Deactivate admin@opsflow.demo"))[0],
    );
    clickLastButton("Deactivate");

    await waitFor(() => {
      expect(mocks.changeAdminUserStatus).toHaveBeenCalledWith({
        id: "admin-1",
        isActive: false,
      });
    });
    expect(
      await screen.findAllByText("Admins cannot deactivate themselves"),
    ).toHaveLength(2);
  });

  it("renders no-data, no-match, and error states", async () => {
    mocks.listAdminUsers.mockResolvedValueOnce(buildListResponse({ users: [], total: 0 }));

    const { unmount } = renderUsers();

    expect(await screen.findByText("No users yet")).toBeInTheDocument();
    unmount();

    mocks.searchParams = new URLSearchParams("search=missing");
    mocks.listAdminUsers.mockResolvedValueOnce(buildListResponse({ users: [], total: 0 }));

    const secondRender = renderUsers();

    expect(await screen.findByText("No matching users")).toBeInTheDocument();
    secondRender.unmount();

    mocks.searchParams = new URLSearchParams();
    mocks.listAdminUsers.mockRejectedValueOnce(new Error("Users unavailable"));

    renderUsers();

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Users unavailable")).toBeInTheDocument();
  });
});

function renderUsers() {
  return renderWithQueryClient(<AdminUserList />);
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

function clickLastButton(name: string) {
  const buttons = screen.getAllByRole("button", { name });
  fireEvent.click(buttons[buttons.length - 1]);
}

function buildListResponse(
  overrides: Partial<AdminUserListData & { total: number }> = {},
): AdminUserListData {
  const users = overrides.users ?? [
    buildUser({
      id: "admin-1",
      name: "Demo Admin",
      email: "admin@opsflow.demo",
      role: "ADMIN",
    }),
    buildUser({
      id: "employee-1",
      name: "Demo Employee",
      email: "employee@opsflow.demo",
      role: "EMPLOYEE",
    }),
  ];
  const total = overrides.total ?? 12;

  return {
    users,
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

function buildUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "user-1",
    name: "Demo User",
    email: "user@opsflow.demo",
    role: "EMPLOYEE",
    isActive: true,
    managerId: null,
    createdAt: "2026-08-13T07:00:00.000Z",
    updatedAt: "2026-08-13T07:00:00.000Z",
    ...overrides,
  };
}
