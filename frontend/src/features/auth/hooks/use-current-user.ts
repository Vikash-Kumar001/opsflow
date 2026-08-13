"use client";

import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/lib/api/api-error";

import { getCurrentUser } from "../services/auth.service";
import type { AuthUser } from "../types/auth.types";
import { authQueryKeys } from "../utils/auth-query-keys";

async function getCurrentUserOrNull(): Promise<AuthUser | null> {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: getCurrentUserOrNull,
    retry: false,
  });
}
