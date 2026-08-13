"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AdminRequestFilterOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type AdminRequestFilterSelectProps<TValue extends string> = {
  label: string;
  value: TValue | "";
  options: Array<AdminRequestFilterOption<TValue>>;
  onChange: (value: TValue | undefined) => void;
  className?: string;
};

export function AdminRequestFilterSelect<TValue extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: AdminRequestFilterSelectProps<TValue>) {
  return (
    <Label className={cn("grid gap-1.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        className="h-8 min-w-32 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        value={value}
        onChange={(event) =>
          onChange(event.target.value ? (event.target.value as TValue) : undefined)
        }
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Label>
  );
}
