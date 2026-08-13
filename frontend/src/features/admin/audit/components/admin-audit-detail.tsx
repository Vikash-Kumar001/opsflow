"use client";

import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import {
  ErrorState,
  PageHeader,
  PageHeaderSkeleton,
  TableSkeleton,
  UserSummary,
} from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isApiError } from "@/lib/api/api-error";

import { AuditActionBadge, AuditEntityBadge } from "./audit-event-badge";
import { useAdminAuditLog } from "../hooks/use-admin-audit-logs";
import type { AdminAuditLog } from "../types/admin-audit.types";
import {
  buildAuditEventSummary,
  buildSafeMetadataLines,
  formatAuditTarget,
} from "../utils/admin-audit-summary";

type AdminAuditDetailProps = {
  auditLogId: string;
};

export function AdminAuditDetail({ auditLogId }: AdminAuditDetailProps) {
  const auditLogQuery = useAdminAuditLog(auditLogId);

  if (auditLogQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (auditLogQuery.isError || !auditLogQuery.data) {
    const error = auditLogQuery.error;

    if (isApiError(error) && error.status === 404) {
      return (
        <ErrorState
          title="Audit event not found"
          message="This audit event does not exist or is unavailable."
          action={
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href="/admin/audit-logs"
            >
              Audit logs
            </Link>
          }
        />
      );
    }

    return (
      <ErrorState
        title="Audit event unavailable"
        message={
          isApiError(error)
            ? error.message
            : "We could not load this audit event."
        }
        onRetry={() => void auditLogQuery.refetch()}
      />
    );
  }

  return <AdminAuditDetailContent auditLog={auditLogQuery.data.auditLog} />;
}

type AdminAuditDetailContentProps = {
  auditLog: AdminAuditLog;
};

function AdminAuditDetailContent({ auditLog }: AdminAuditDetailContentProps) {
  const metadataLines = buildSafeMetadataLines(auditLog.metadata);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin audit browser"
        title={formatAuditTarget(auditLog)}
        description={buildAuditEventSummary(auditLog)}
        actions={
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/admin/audit-logs"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Audit logs
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event summary</CardTitle>
              <CardDescription>
                Structured audit context for the selected event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <AuditActionBadge action={auditLog.action} />
                <AuditEntityBadge entityType={auditLog.entityType} />
              </div>
              <DescriptionList
                items={[
                  ["Event ID", auditLog.id],
                  [
                    "Occurred",
                    format(new Date(auditLog.createdAt), "MMM d, yyyy h:mm a"),
                  ],
                  ["Resource", formatAuditTarget(auditLog)],
                  ["Correlation ID", auditLog.correlationId ?? "Not captured"],
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Readable metadata</CardTitle>
              <CardDescription>
                Sensitive metadata keys are omitted before display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metadataLines.length > 0 ? (
                <DescriptionList
                  items={metadataLines.map((line) => [line.label, line.value])}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No safe metadata was captured for this event.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actor</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLog.actor ? (
                <UserSummary user={auditLog.actor} />
              ) : (
                <p className="text-sm text-muted-foreground">System</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource links</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                items={[
                  ["Target user ID", auditLog.targetUserId ?? "None"],
                  ["Target request ID", auditLog.targetRequestId ?? "None"],
                  ["Target comment ID", auditLog.targetCommentId ?? "None"],
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request context</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                items={[
                  ["IP address", auditLog.ipAddress ?? "Not captured"],
                  ["User agent", auditLog.userAgent ?? "Not captured"],
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type DescriptionListProps = {
  items: Array<[string, string]>;
};

function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl className="grid gap-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
        >
          <dt className="text-xs font-medium tracking-normal text-muted-foreground uppercase">
            {label}
          </dt>
          <dd className="min-w-0 break-words text-sm text-foreground">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
