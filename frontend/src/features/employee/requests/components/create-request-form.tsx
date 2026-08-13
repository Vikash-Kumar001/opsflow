"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { EmployeeRequestFormValues } from "../schemas/employee-request-form.schema";
import { useCreateRequest } from "../hooks/use-create-request";
import { mapRequestFormApiError } from "../utils/request-form-api-errors";
import { EmployeeRequestForm } from "./employee-request-form";

const CREATE_REQUEST_DEFAULT_VALUES: EmployeeRequestFormValues = {
  title: "",
  category: "OTHER",
  description: "",
  priority: "MEDIUM",
};

export function CreateRequestForm() {
  const router = useRouter();
  const createRequest = useCreateRequest();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <EmployeeRequestForm
      mode="create"
      defaultValues={CREATE_REQUEST_DEFAULT_VALUES}
      errorMessage={errorMessage}
      successMessage={null}
      isPending={createRequest.isPending}
      onSubmit={(values, setError) => {
        setErrorMessage(null);
        createRequest.mutate(values, {
          onSuccess: (data) => {
            router.push(`/employee/requests/${data.request.id}`);
          },
          onError: (error) => {
            setErrorMessage(mapRequestFormApiError(error, setError));
          },
        });
      }}
    />
  );
}
