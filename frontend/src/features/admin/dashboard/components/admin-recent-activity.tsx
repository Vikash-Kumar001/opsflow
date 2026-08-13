import { formatDistanceToNow } from "date-fns";

import { EmptyState, UserSummary } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminAuditLog } from "@/features/admin/audit/types/admin-audit.types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from "@/features/admin/audit/utils/admin-audit-labels";

type AdminRecentActivityProps = {
  activity: AdminAuditLog[];
};

export function AdminRecentActivity({ activity }: AdminRecentActivityProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-medium text-foreground">
          Recent activity
        </h2>
        <p className="text-sm text-muted-foreground">
          Audited events from authentication, requests, comments, and user
          management.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {activity.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No audit activity"
                description="Audited system activity will appear here as users work."
              />
            </div>
          ) : (
            <ul className="divide-y" aria-label="Recent audit activity">
              {activity.map((event) => (
                <li key={event.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {AUDIT_ACTION_LABELS[event.action]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {AUDIT_ENTITY_LABELS[event.entityType]}
                          {formatAuditTarget(event)}
                        </p>
                      </div>
                      {event.actor ? (
                        <UserSummary user={event.actor} size="sm" />
                      ) : (
                        <p className="text-sm text-muted-foreground">System</p>
                      )}
                    </div>
                    <time
                      className="shrink-0 text-sm text-muted-foreground"
                      dateTime={event.createdAt}
                    >
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function formatAuditTarget(event: AdminAuditLog): string {
  if (event.targetRequest) {
    return ` - ${event.targetRequest.requestNumber}`;
  }

  if (event.targetUser) {
    return ` - ${event.targetUser.email}`;
  }

  if (event.targetComment) {
    return " - Comment";
  }

  return "";
}
