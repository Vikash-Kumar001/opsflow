import { PageHeaderSkeleton } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeeProfileSkeleton() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeaderSkeleton />
      <div
        className="grid gap-6 lg:grid-cols-[1fr_18rem]"
        aria-label="Loading employee profile"
      >
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </section>
  );
}
