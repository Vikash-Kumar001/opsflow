"use client";

import { KeyRound, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { useLogout } from "@/features/auth/hooks/use-logout";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { ROUTES } from "@/features/auth/utils/auth-redirects";

type UserMenuProps = {
  user: AuthUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const logoutMutation = useLogout();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open user menu"
              className="h-10 gap-2 px-2"
              type="button"
              variant="ghost"
            />
          }
        >
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-36 truncate text-sm sm:inline">
            {user.name}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <span className="block truncate text-foreground">{user.name}</span>
              <span className="block truncate font-normal">{user.email}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
            <KeyRound />
            Change password
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={logoutMutation.isPending}
            onClick={() =>
              logoutMutation.mutate(undefined, {
                onSettled: () => router.replace(ROUTES.LOGIN),
              })
            }
          >
            <LogOut />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </>
  );
}
