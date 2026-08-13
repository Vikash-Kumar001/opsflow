import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FilterToolbarProps = {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
};

export function FilterToolbar({
  search,
  filters,
  actions,
  onReset,
  resetLabel = "Reset filters",
  className,
}: FilterToolbarProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "flex flex-col gap-3 p-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end">
        {search ? <div className="min-w-0 flex-1">{search}</div> : null}
        {filters ? (
          <div className="flex flex-wrap items-end gap-2">{filters}</div>
        ) : null}
      </div>
      {(actions || onReset) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onReset ? (
            <Button type="button" variant="outline" onClick={onReset}>
              {resetLabel}
            </Button>
          ) : null}
          {actions}
        </div>
      )}
    </Card>
  );
}
