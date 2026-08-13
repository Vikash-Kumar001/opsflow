import { CheckCircle2, XCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { RequestSummary } from "@/features/shared/requests";

type EmployeeRequestReviewResultProps = {
  request: RequestSummary;
};

export function EmployeeRequestReviewResult({
  request,
}: EmployeeRequestReviewResultProps) {
  if (request.status === "APPROVED") {
    return (
      <Alert>
        <CheckCircle2 aria-hidden="true" />
        <AlertTitle>Request approved</AlertTitle>
        <AlertDescription>
          {request.reviewNotes || "Your manager approved this request."}
        </AlertDescription>
      </Alert>
    );
  }

  if (request.status === "REJECTED") {
    return (
      <Alert variant="destructive">
        <XCircle aria-hidden="true" />
        <AlertTitle>Request rejected</AlertTitle>
        <AlertDescription>
          {request.rejectionReason || request.reviewNotes || "No rejection reason was provided."}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
