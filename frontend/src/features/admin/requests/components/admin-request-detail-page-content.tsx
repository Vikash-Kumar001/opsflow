"use client";

import { useParams } from "next/navigation";

import { AdminRequestDetail } from "./admin-request-detail";

export function AdminRequestDetailPageContent() {
  const params = useParams<{ id: string }>();

  return <AdminRequestDetail requestId={params.id} />;
}
