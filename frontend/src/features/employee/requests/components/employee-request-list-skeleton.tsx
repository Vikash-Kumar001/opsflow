import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared";

export function EmployeeRequestListSkeleton() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={2} />
      <TableSkeleton rows={6} />
    </section>
  );
}
