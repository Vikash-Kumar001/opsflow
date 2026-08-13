import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RequestMetadataItem = {
  label: string;
  value: string | number | null | undefined;
};

type RequestMetadataListProps = {
  items: RequestMetadataItem[];
  className?: string;
};

export function RequestMetadataList({
  items,
  className,
}: RequestMetadataListProps) {
  const visibleItems = items.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== "",
  );

  return (
    <Card size="sm" className={cn("divide-y py-0", className)}>
      <dl className="divide-y">
        {visibleItems.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 px-3 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4"
          >
            <dt className="text-xs font-medium text-muted-foreground">
              {item.label}
            </dt>
            <dd className="min-w-0 break-words text-sm text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
