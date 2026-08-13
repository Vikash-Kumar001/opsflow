import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type UserSummaryViewModel = {
  name: string;
  email?: string | null;
  role?: string | null;
};

type UserSummaryProps = {
  user: UserSummaryViewModel;
  size?: "sm" | "default" | "lg";
  className?: string;
};

export function UserSummary({
  user,
  size = "default",
  className,
}: UserSummaryProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <Avatar size={size}>
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {user.name}
        </p>
        {user.email || user.role ? (
          <p className="truncate text-xs text-muted-foreground">
            {user.email ?? user.role}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
