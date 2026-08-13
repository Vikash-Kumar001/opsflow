"use client";

import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/features/auth/types/auth.types";
import type { NavigationItem } from "@/navigation/navigation.types";

import { Breadcrumbs } from "./breadcrumbs";
import { MobileSidebar } from "./mobile-sidebar";
import { UserMenu } from "./user-menu";

type AppHeaderProps = {
  navigation: readonly NavigationItem[];
  pathname: string;
  user: AuthUser;
};

export function AppHeader({ navigation, pathname, user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar navigation={navigation} />
        <div className="min-w-0">
          <Breadcrumbs pathname={pathname} />
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{user.role}</Badge>
            <span className="truncate text-sm text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </div>
      <UserMenu user={user} />
    </header>
  );
}
