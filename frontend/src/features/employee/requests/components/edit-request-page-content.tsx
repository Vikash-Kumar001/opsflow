"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/shared";

import { EditRequestForm } from "./edit-request-form";

export function EditRequestPageContent() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee requests"
        title="Edit request"
        description="Update the ordinary request fields while the request is still eligible for employee edits."
      />
      <EditRequestForm requestId={params.id} />
    </div>
  );
}
