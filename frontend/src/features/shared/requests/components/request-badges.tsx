import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../types/request.types";
import {
  REQUEST_CATEGORY_LABELS,
  REQUEST_PRIORITY_LABELS,
  REQUEST_STATUS_LABELS,
} from "../utils/request-labels";

type BadgeProps<TValue extends string> = {
  value: TValue;
  className?: string;
};

export function RequestStatusBadge({
  value,
  className,
}: BadgeProps<RequestStatus>) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        statusClassName[value],
        className,
      )}
    >
      {REQUEST_STATUS_LABELS[value]}
    </Badge>
  );
}

export function RequestPriorityBadge({
  value,
  className,
}: BadgeProps<RequestPriority>) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        priorityClassName[value],
        className,
      )}
    >
      {REQUEST_PRIORITY_LABELS[value]}
    </Badge>
  );
}

export function RequestCategoryBadge({
  value,
  className,
}: BadgeProps<RequestCategory>) {
  return (
    <Badge variant="secondary" className={className}>
      {REQUEST_CATEGORY_LABELS[value]}
    </Badge>
  );
}

const statusClassName = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  IN_REVIEW: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  APPROVED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  REJECTED: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  CANCELLED:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
} as const satisfies Record<RequestStatus, string>;

const priorityClassName = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  HIGH: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  URGENT: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
} as const satisfies Record<RequestPriority, string>;
