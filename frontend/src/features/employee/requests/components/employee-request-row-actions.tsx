import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { RequestSummary } from "@/features/shared/requests";
import { cn } from "@/lib/utils";

import {
  canEmployeeCancelRequest,
  canEmployeeEditRequest,
  canEmployeeSubmitRequest,
} from "../utils/employee-request-actions";

type EmployeeRequestRowActionsProps = {
  request: RequestSummary;
};

export function EmployeeRequestRowActions({
  request,
}: EmployeeRequestRowActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Link
        className={buttonVariants({ variant: "outline", size: "xs" })}
        href={`/employee/requests/${request.id}`}
      >
        View
      </Link>
      {canEmployeeEditRequest(request.status) ? (
        <Link
          className={buttonVariants({ variant: "ghost", size: "xs" })}
          href={`/employee/requests/${request.id}/edit`}
        >
          Edit
        </Link>
      ) : null}
      {canEmployeeSubmitRequest(request.status) ? (
        <span
          className={cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "text-muted-foreground",
          )}
          aria-label={`Submit ${request.requestNumber}`}
        >
          Submit
        </span>
      ) : null}
      {canEmployeeCancelRequest(request.status) ? (
        <span
          className={cn(
            buttonVariants({ variant: "destructive", size: "xs" }),
            "bg-transparent",
          )}
          aria-label={`Cancel ${request.requestNumber}`}
        >
          Cancel
        </span>
      ) : null}
    </div>
  );
}
