"use client";

import { useParams } from "next/navigation";

import { ManagerRequestDetail } from "./manager-request-detail";

export function ManagerRequestDetailPageContent() {
  const params = useParams<{ id: string }>();

  return <ManagerRequestDetail requestId={params.id} />;
}
