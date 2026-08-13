"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell/app-shell";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import {
  buildLoginPath,
  canRoleAccessPath,
  ROUTES,
} from "@/features/auth/utils/auth-redirects";
import { AuthLoadingState } from "@/features/auth/components/auth-loading-state";

type ProtectedAppLayoutProps = {
  children: ReactNode;
};

export function ProtectedAppLayout({ children }: ProtectedAppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    if (currentUserQuery.isLoading) {
      return;
    }

    if (!currentUserQuery.data) {
      router.replace(buildLoginPath(pathname));
      return;
    }

    if (!canRoleAccessPath(currentUserQuery.data.role, pathname)) {
      router.replace(ROUTES.FORBIDDEN);
    }
  }, [currentUserQuery.data, currentUserQuery.isLoading, pathname, router]);

  if (currentUserQuery.isLoading || !currentUserQuery.data) {
    return <AuthLoadingState />;
  }

  if (!canRoleAccessPath(currentUserQuery.data.role, pathname)) {
    return <AuthLoadingState />;
  }

  return <AppShell user={currentUserQuery.data}>{children}</AppShell>;
}
