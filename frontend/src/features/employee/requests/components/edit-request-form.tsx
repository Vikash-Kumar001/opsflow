"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ErrorState, PageHeaderSkeleton, TableSkeleton } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import type { RequestSummary } from "@/features/shared/requests";
import { REQUEST_STATUS_LABELS } from "@/features/shared/requests";

import { useEmployeeRequest } from "../hooks/use-employee-request";
import { useUpdateRequest } from "../hooks/use-update-request";
import type { EmployeeRequestFormValues } from "../schemas/employee-request-form.schema";
import { mapRequestFormApiError } from "../utils/request-form-api-errors";
import { canEmployeeEditRequest } from "../utils/employee-request-actions";
import { EmployeeRequestForm } from "./employee-request-form";

type EditRequestFormProps = {
  requestId: string;
};

export function EditRequestForm({ requestId }: EditRequestFormProps) {
  const requestQuery = useEmployeeRequest(requestId);
  const updateRequest = useUpdateRequest();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (requestQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <ErrorState
        title="Request unavailable"
        message="We could not load this request for editing."
        onRetry={() => void requestQuery.refetch()}
      />
    );
  }

  const request = requestQuery.data.request;

  if (!canEmployeeEditRequest(request.status)) {
    return <IneligibleRequestState request={request} />;
  }

  return (
    <EmployeeRequestForm
      mode="edit"
      request={request}
      defaultValues={toRequestFormValues(request)}
      errorMessage={errorMessage}
      successMessage={successMessage}
      isPending={updateRequest.isPending}
      onSubmit={(values, setError) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        updateRequest.mutate(
          { id: request.id, payload: values },
          {
            onSuccess: () => {
              setSuccessMessage("Request updated");
            },
            onError: (error) => {
              setErrorMessage(mapRequestFormApiError(error, setError));
            },
          },
        );
      }}
    />
  );
}

function IneligibleRequestState({ request }: { request: RequestSummary }) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle aria-hidden="true" />
        <AlertTitle>This request cannot be edited</AlertTitle>
        <AlertDescription>
          {request.requestNumber} is {REQUEST_STATUS_LABELS[request.status].toLowerCase()}.
          Employee edits are available only for draft or pending requests.
        </AlertDescription>
      </Alert>
      <Link
        className={buttonVariants({ variant: "outline" })}
        href="/employee/requests"
      >
        <ArrowLeft data-icon="inline-start" />
        Back to my requests
      </Link>
    </div>
  );
}

function toRequestFormValues(request: RequestSummary): EmployeeRequestFormValues {
  return {
    title: request.title,
    category: request.category,
    description: request.description,
    priority: request.priority,
  };
}
