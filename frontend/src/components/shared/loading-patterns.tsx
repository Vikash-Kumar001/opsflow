import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonListProps = {
  rows?: number;
  className?: string;
};

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 border-b pb-5" aria-label="Loading page header">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-full max-w-2xl" />
    </div>
  );
}

export function StatGridSkeleton({ rows = 4, className }: SkeletonListProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      aria-label="Loading statistics"
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, className }: SkeletonListProps) {
  return (
    <div
      className={cn("space-y-2 rounded-lg border bg-card p-3", className)}
      aria-label="Loading table"
    >
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
