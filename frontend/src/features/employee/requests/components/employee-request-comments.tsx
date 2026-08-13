"use client";

import { RequestComments } from "@/features/shared/comments";

type EmployeeRequestCommentsProps = {
  requestId: string;
};

export function EmployeeRequestComments({
  requestId,
}: EmployeeRequestCommentsProps) {
  return (
    <RequestComments
      requestId={requestId}
      emptyDescription="Add context or follow-up details for this request."
    />
  );
}
