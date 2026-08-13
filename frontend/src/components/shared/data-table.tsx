import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<TItem> = {
  id: string;
  header: ReactNode;
  cell: (item: TItem) => ReactNode;
  className?: string;
};

type DataTableProps<TItem> = {
  columns: Array<DataTableColumn<TItem>>;
  data: TItem[];
  getRowKey: (item: TItem) => string;
  emptyState?: ReactNode;
  "aria-label": string;
  className?: string;
};

export function DataTable<TItem>({
  columns,
  data,
  getRowKey,
  emptyState,
  "aria-label": ariaLabel,
  className,
}: DataTableProps<TItem>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Table aria-label={ariaLabel}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={getRowKey(item)}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
