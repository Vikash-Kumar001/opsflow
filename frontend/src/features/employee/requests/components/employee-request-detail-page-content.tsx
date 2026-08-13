"use client";

import { useParams } from "next/navigation";

import { EmployeeRequestDetail } from "./employee-request-detail";

export function EmployeeRequestDetailPageContent() {
  const params = useParams<{ id: string }>();

  return <EmployeeRequestDetail requestId={params.id} />;
}
