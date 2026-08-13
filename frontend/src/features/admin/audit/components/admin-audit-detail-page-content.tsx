"use client";

import { useParams } from "next/navigation";

import { AdminAuditDetail } from "./admin-audit-detail";

export function AdminAuditDetailPageContent() {
  const params = useParams<{ id: string }>();

  return <AdminAuditDetail auditLogId={params.id} />;
}
