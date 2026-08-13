import type { UseFormSetError } from "react-hook-form";

import { isApiError } from "@/lib/api/api-error";

import type { EmployeeRequestFormValues } from "../schemas/employee-request-form.schema";

const FORM_FIELDS = ["title", "category", "description", "priority"] as const;

type RequestFormField = (typeof FORM_FIELDS)[number];

type ValidationIssue = {
  path?: unknown;
  message?: unknown;
};

export function mapRequestFormApiError(
  error: unknown,
  setError: UseFormSetError<EmployeeRequestFormValues>,
): string {
  if (!isApiError(error)) {
    return "Unable to save the request. Please try again.";
  }

  let mappedFieldError = false;

  if (Array.isArray(error.details)) {
    for (const issue of error.details) {
      const field = getIssueField(issue);

      if (!field) {
        continue;
      }

      mappedFieldError = true;
      setError(field, {
        type: "server",
        message:
          typeof issue.message === "string" ? issue.message : "Invalid value",
      });
    }
  }

  if (mappedFieldError) {
    return "Please fix the highlighted fields.";
  }

  return error.message || "Unable to save the request. Please try again.";
}

function getIssueField(issue: unknown): RequestFormField | null {
  if (!isValidationIssue(issue) || !Array.isArray(issue.path)) {
    return null;
  }

  const field = issue.path[0];

  return isRequestFormField(field) ? field : null;
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return typeof value === "object" && value !== null;
}

function isRequestFormField(value: unknown): value is RequestFormField {
  return FORM_FIELDS.includes(value as RequestFormField);
}
