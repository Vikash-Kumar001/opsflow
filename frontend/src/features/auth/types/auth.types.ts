export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type LoginResponse = {
  user: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser;
};

export type ChangePasswordResponse = {
  user: AuthUser;
};

export type LogoutResponse = {
  loggedOut: true;
};
