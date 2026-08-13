import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/shared";

export function AdminAuditListSkeleton() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton rows={3} className="xl:grid-cols-3" />
      <TableSkeleton rows={8} />
    </section>
  );
}
