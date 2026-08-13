"use client";

import { useId } from "react";
import { LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
};

export function SearchInput({
  value,
  onChange,
  label = "Search",
  placeholder = "Search",
  className,
  isLoading = false,
}: SearchInputProps) {
  const inputId = useId();

  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <Label htmlFor={inputId} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        {isLoading ? (
          <LoaderCircleIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <Input
          id={inputId}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pr-8 pl-8"
          aria-busy={isLoading || undefined}
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <XIcon aria-hidden="true" />
          </Button>
        ) : null}
        <span
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading ? "Updating search results" : ""}
        </span>
      </div>
    </div>
  );
}
