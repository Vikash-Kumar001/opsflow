import Link from "next/link";
import { EyeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import type { TeamRequest } from "../types/manager-request-list.types";

type ManagerRequestRowActionsProps = {
  request: TeamRequest;
};

export function ManagerRequestRowActions({
  request,
}: ManagerRequestRowActionsProps) {
  return (
    <Link
      className={buttonVariants({ variant: "outline", size: "sm" })}
      href={`/manager/requests/${request.id}`}
      aria-label={`Review ${request.requestNumber}`}
    >
      <EyeIcon aria-hidden="true" />
      Review
    </Link>
  );
}
