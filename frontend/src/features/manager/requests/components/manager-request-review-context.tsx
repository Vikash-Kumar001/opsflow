import { FileText } from "lucide-react";

import { EmptyState } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { TeamRequest } from "../types/manager-request-list.types";

type ManagerRequestReviewContextProps = {
  request: TeamRequest;
};

export function ManagerRequestReviewContext({
  request,
}: ManagerRequestReviewContextProps) {
  const hasReviewText = request.reviewNotes || request.rejectionReason;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Review context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasReviewText ? (
          <>
            {request.reviewNotes ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Review notes</h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {request.reviewNotes}
                </p>
              </section>
            ) : null}
            {request.rejectionReason ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Rejection reason</h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {request.rejectionReason}
                </p>
              </section>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No review notes yet"
            description="Review notes and decision context will appear here after a manager action."
            icon={FileText}
          />
        )}
      </CardContent>
    </Card>
  );
}
