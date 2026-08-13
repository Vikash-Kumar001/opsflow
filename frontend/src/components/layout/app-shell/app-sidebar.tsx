"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/navigation/navigation.types";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  navigation: readonly NavigationItem[];
};

export function AppSidebar({ navigation }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-dvh w-64 shrink-0 overflow-hidden border-r bg-white lg:flex lg:flex-col">
      <SidebarContent navigation={navigation} pathname={pathname} />
    </aside>
  );
}

export function SidebarContent({
  navigation,
  pathname,
}: AppSidebarProps & { pathname: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-3 py-4">
      <div className="px-2">
        <p className="text-lg font-semibold text-zinc-950">OpsFlow</p>
        <p className="text-sm text-muted-foreground">Request operations</p>
      </div>
      <nav
        aria-label="Primary navigation"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto"
      >
        {navigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center rounded-md px-2 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
