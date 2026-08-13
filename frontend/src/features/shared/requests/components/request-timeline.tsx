import { format } from "date-fns";

import { cn } from "@/lib/utils";

import type { RequestTimelineEvent } from "../types/request.types";

type RequestTimelineProps = {
  events: RequestTimelineEvent[];
  className?: string;
};

export function RequestTimeline({ events, className }: RequestTimelineProps) {
  return (
    <ol className={cn("space-y-4", className)} aria-label="Request timeline">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-3">
          <span
            className="mt-1 flex size-2.5 shrink-0 rounded-full bg-foreground"
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <p className="text-sm font-medium text-foreground">
                {event.label}
              </p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={toDate(event.timestamp).toISOString()}
              >
                {format(toDate(event.timestamp), "MMM d, yyyy h:mm a")}
              </time>
            </div>
            {event.description ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {event.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}
