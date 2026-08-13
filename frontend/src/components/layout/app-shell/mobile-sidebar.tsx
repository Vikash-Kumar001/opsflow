"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavigationItem } from "@/navigation/navigation.types";

import { SidebarContent } from "./app-sidebar";

type MobileSidebarProps = {
  navigation: readonly NavigationItem[];
};

export function MobileSidebar({ navigation }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            size="icon"
            type="button"
            variant="outline"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarContent navigation={navigation} pathname={pathname} />
      </SheetContent>
    </Sheet>
  );
}
