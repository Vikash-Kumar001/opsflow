import { format } from "date-fns";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

import {
  DataTable,
  UserSummary,
  type DataTableColumn,
} from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";

import { AuditActionBadge, AuditEntityBadge } from "./audit-event-badge";
import type { AdminAuditLog } from "../types/admin-audit.types";
import {
  buildAuditEventSummary,
  formatAuditTarget,
} from "../utils/admin-audit-summary";

type AdminAuditListTableProps = {
  auditLogs: AdminAuditLog[];
};

export function AdminAuditListTable({ auditLogs }: AdminAuditListTableProps) {
  return (
    <DataTable
      aria-label="Audit logs"
      className="hidden md:block"
      columns={columns}
      data={auditLogs}
      getRowKey={(event) => event.id}
    />
  );
}

const columns: Array<DataTableColumn<AdminAuditLog>> = [
  {
    id: "event",
    header: "Event",
    cell: (event) => (
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap gap-2">
          <AuditActionBadge action={event.action} />
          <AuditEntityBadge entityType={event.entityType} />
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          {buildAuditEventSummary(event)}
        </p>
      </div>
    ),
  },
  {
    id: "actor",
    header: "Actor",
    cell: (event) =>
      event.actor ? (
        <UserSummary user={event.actor} />
      ) : (
        <span className="text-sm text-muted-foreground">System</span>
      ),
  },
  {
    id: "resource",
    header: "Resource",
    cell: (event) => (
      <span className="text-sm text-foreground">{formatAuditTarget(event)}</span>
    ),
    className: "hidden xl:table-cell",
  },
  {
    id: "date",
    header: "Date",
    cell: (event) => (
      <time dateTime={event.createdAt}>
        {format(new Date(event.createdAt), "MMM d, yyyy h:mm a")}
      </time>
    ),
    className: "hidden lg:table-cell whitespace-nowrap",
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    cell: (event) => (
      <Link
        className={buttonVariants({ variant: "outline", size: "sm" })}
        href={`/admin/audit-logs/${event.id}`}
        aria-label={`View audit event ${event.id}`}
      >
        <EyeIcon data-icon="inline-start" />
        View
      </Link>
    ),
    className: "text-right",
  },
];
