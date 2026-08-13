import { ArchiveIcon, Clock3Icon, WorkflowIcon } from "lucide-react";

import { StatCard } from "@/components/shared";
import type { RequestSummary } from "@/features/shared/requests";

import type { AdminRequestListData } from "../types/admin-request.types";

type AdminRequestListStatsProps = {
  data: AdminRequestListData;
};

export function AdminRequestListStats({ data }: AdminRequestListStatsProps) {
  const pendingVisible = countVisibleByStatus(data.requests, "PENDING");
  const inReviewVisible = countVisibleByStatus(data.requests, "IN_REVIEW");

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total requests"
        value={data.pagination.total}
        description="Matching current query"
        icon={WorkflowIcon}
      />
      <StatCard
        label="Visible pending"
        value={pendingVisible}
        description={`${inReviewVisible} in review on this page`}
        icon={Clock3Icon}
      />
      <StatCard
        label="Admin action"
        value="Archive"
        description="Soft delete preserves history"
        icon={ArchiveIcon}
      />
    </div>
  );
}

function countVisibleByStatus(
  requests: RequestSummary[],
  status: RequestSummary["status"],
): number {
  return requests.filter((request) => request.status === status).length;
}
