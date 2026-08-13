import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

export function ManagerRequestListSkeleton() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-24 rounded-xl" />
      <StatGridSkeleton rows={3} className="xl:grid-cols-3" />
      <TableSkeleton rows={8} />
    </section>
  );
}
