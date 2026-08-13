import { FileClockIcon, ShieldAlertIcon, UserCogIcon } from "lucide-react";

import { StatCard } from "@/components/shared";

import type { AdminAuditListData } from "../types/admin-audit.types";

type AdminAuditListStatsProps = {
  data: AdminAuditListData;
};

export function AdminAuditListStats({ data }: AdminAuditListStatsProps) {
  const visibleSecurityEvents = data.auditLogs.filter((event) =>
    event.action.startsWith("LOGIN"),
  ).length;
  const visibleUserEvents = data.auditLogs.filter(
    (event) => event.entityType === "USER",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total audit events"
        value={data.pagination.total.toLocaleString()}
        description="Matching current filters"
        icon={FileClockIcon}
      />
      <StatCard
        label="Visible security events"
        value={visibleSecurityEvents.toLocaleString()}
        description="Authentication events on this page"
        icon={ShieldAlertIcon}
      />
      <StatCard
        label="Visible user events"
        value={visibleUserEvents.toLocaleString()}
        description="Account and role events on this page"
        icon={UserCogIcon}
      />
    </div>
  );
}
