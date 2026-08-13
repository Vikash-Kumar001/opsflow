"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "../hooks/use-current-user";
import { buildLoginPath, getRoleLandingPath } from "../utils/auth-redirects";
import { AuthLoadingState } from "./auth-loading-state";

export function DashboardRedirect() {
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

    router.replace(getRoleLandingPath(currentUserQuery.data.role));
  }, [currentUserQuery.data, currentUserQuery.isLoading, pathname, router]);

  return <AuthLoadingState />;
}
