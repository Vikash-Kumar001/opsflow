"use client";

import { ArchiveIcon, EyeIcon } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { RequestSummary } from "@/features/shared/requests";

import { DeleteAdminRequestDialog } from "./delete-admin-request-dialog";

type AdminRequestRowActionsProps = {
  request: RequestSummary;
  isDeletePending: boolean;
  onDelete: (request: RequestSummary) => Promise<void>;
};

export function AdminRequestRowActions({
  request,
  isDeletePending,
  onDelete,
}: AdminRequestRowActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        aria-label={`View ${request.requestNumber}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
        href={`/admin/requests/${request.id}`}
      >
        <EyeIcon data-icon="inline-start" />
        View
      </Link>
      <DeleteAdminRequestDialog
        request={request}
        isPending={isDeletePending}
        onConfirm={() => onDelete(request)}
        trigger={
          <Button
            aria-label={`Archive ${request.requestNumber}`}
            size="sm"
            type="button"
            variant="destructive"
          >
            <ArchiveIcon data-icon="inline-start" />
            Archive
          </Button>
        }
      />
    </div>
  );
}
