import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/shared";

export function EmployeeDashboardSkeleton() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton rows={4} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <TableSkeleton rows={5} />
        <TableSkeleton rows={3} />
      </div>
    </section>
  );
}
