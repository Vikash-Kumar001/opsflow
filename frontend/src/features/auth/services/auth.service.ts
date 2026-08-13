import { apiRequest } from "@/lib/api/api-client";

import type {
  AuthUser,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
} from "../types/auth.types";

const AUTH_PATH = "/auth";

export async function login(payload: LoginRequest): Promise<AuthUser> {
  const response = await apiRequest<LoginResponse>(`${AUTH_PATH}/login`, {
    method: "POST",
    body: payload,
  });

  return response.user;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<CurrentUserResponse>(`${AUTH_PATH}/me`);

  return response.user;
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(`${AUTH_PATH}/logout`, {
    method: "POST",
  });
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<AuthUser> {
  const response = await apiRequest<ChangePasswordResponse>(
    `${AUTH_PATH}/password`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return response.user;
}
