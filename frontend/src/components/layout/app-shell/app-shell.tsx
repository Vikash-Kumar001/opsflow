"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { AuthUser } from "@/features/auth/types/auth.types";
import { getVisibleNavigation } from "@/navigation/navigation.service";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppShellProps = {
  children: ReactNode;
  user: AuthUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const navigation = getVisibleNavigation(user);

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50">
      <AppSidebar navigation={navigation} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader navigation={navigation} pathname={pathname} user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
