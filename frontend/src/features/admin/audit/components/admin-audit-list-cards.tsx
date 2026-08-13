import { format } from "date-fns";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

import { UserSummary } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AuditActionBadge, AuditEntityBadge } from "./audit-event-badge";
import type { AdminAuditLog } from "../types/admin-audit.types";
import {
  buildAuditEventSummary,
  formatAuditTarget,
} from "../utils/admin-audit-summary";

type AdminAuditListCardsProps = {
  auditLogs: AdminAuditLog[];
};

export function AdminAuditListCards({ auditLogs }: AdminAuditListCardsProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {auditLogs.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <AuditActionBadge action={event.action} />
                <AuditEntityBadge entityType={event.entityType} />
              </div>
              <CardTitle className="text-base">
                {formatAuditTarget(event)}
              </CardTitle>
              <CardDescription>
                {format(new Date(event.createdAt), "MMM d, yyyy h:mm a")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {buildAuditEventSummary(event)}
            </p>
            {event.actor ? (
              <UserSummary user={event.actor} />
            ) : (
              <p className="text-sm text-muted-foreground">System</p>
            )}
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={`/admin/audit-logs/${event.id}`}
              aria-label={`View audit event ${event.id}`}
            >
              <EyeIcon data-icon="inline-start" />
              View event
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
