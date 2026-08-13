import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/shared";

export function AdminDashboardSkeleton() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton rows={5} className="xl:grid-cols-5" />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <TableSkeleton rows={7} />
        <TableSkeleton rows={6} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <TableSkeleton rows={5} />
        <TableSkeleton rows={8} />
      </div>
    </section>
  );
}
