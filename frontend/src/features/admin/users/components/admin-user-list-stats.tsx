import { ShieldCheckIcon, UserCheckIcon, UserXIcon } from "lucide-react";

import { StatCard } from "@/components/shared";

import type { AdminUserListData } from "../types/admin-user.types";

type AdminUserListStatsProps = {
  data: AdminUserListData;
};

export function AdminUserListStats({ data }: AdminUserListStatsProps) {
  const visibleActive = data.users.filter((user) => user.isActive).length;
  const visibleInactive = data.users.length - visibleActive;
  const visibleAdmins = data.users.filter((user) => user.role === "ADMIN").length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total users"
        value={data.pagination.total}
        description="Matching current query"
        icon={UserCheckIcon}
      />
      <StatCard
        label="Visible active"
        value={visibleActive}
        description={`${visibleInactive} inactive on this page`}
        icon={UserCheckIcon}
      />
      <StatCard
        label="Visible admins"
        value={visibleAdmins}
        description="Admin users on this page"
        icon={ShieldCheckIcon}
        trend={
          visibleInactive > 0 ? (
            <span className="inline-flex items-center gap-1">
              <UserXIcon className="size-3" aria-hidden="true" />
              {visibleInactive}
            </span>
          ) : null
        }
      />
    </div>
  );
}
