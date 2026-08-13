"use client";

import type { ReactNode } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { AuthLoadingState } from "@/features/auth/components/auth-loading-state";

import { canEvery } from "./can";
import type { Permission } from "./permission.types";

type PermissionGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  permissions: readonly Permission[];
};

export function PermissionGuard({
  children,
  fallback = null,
  permissions,
}: PermissionGuardProps) {
  const currentUserQuery = useCurrentUser();

  if (currentUserQuery.isLoading) {
    return <AuthLoadingState />;
  }

  if (!canEvery(currentUserQuery.data, permissions)) {
    return fallback;
  }

  return children;
}
