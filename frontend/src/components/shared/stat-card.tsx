import type { ComponentType, ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  trend?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="truncate">{label}</CardDescription>
          {Icon ? (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <CardTitle className="text-2xl leading-none">{value}</CardTitle>
      </CardHeader>
      {(description || trend) && (
        <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          {description ? <span className="min-w-0">{description}</span> : null}
          {trend ? <span className="shrink-0">{trend}</span> : null}
        </CardContent>
      )}
    </Card>
  );
}
