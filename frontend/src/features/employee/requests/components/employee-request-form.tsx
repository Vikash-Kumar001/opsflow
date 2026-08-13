"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm, type UseFormSetError } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  type RequestSummary,
} from "@/features/shared/requests";
import {
  REQUEST_CATEGORY_LABELS,
  REQUEST_PRIORITY_LABELS,
} from "@/features/shared/requests";
import { cn } from "@/lib/utils";

import {
  employeeRequestFormSchema,
  type EmployeeRequestFormValues,
} from "../schemas/employee-request-form.schema";

type EmployeeRequestFormProps = {
  mode: "create" | "edit";
  defaultValues: EmployeeRequestFormValues;
  request?: RequestSummary;
  errorMessage?: string | null;
  successMessage?: string | null;
  isPending: boolean;
  onSubmit: (
    values: EmployeeRequestFormValues,
    setError: UseFormSetError<EmployeeRequestFormValues>,
  ) => void;
};

export function EmployeeRequestForm({
  mode,
  defaultValues,
  request,
  errorMessage,
  successMessage,
  isPending,
  onSubmit,
}: EmployeeRequestFormProps) {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<EmployeeRequestFormValues>({
    resolver: zodResolver(employeeRequestFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const actionLabel = mode === "create" ? "Create request" : "Save changes";
  const pendingLabel = mode === "create" ? "Creating..." : "Saving...";

  return (
    <Card className="rounded-lg">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>
              {mode === "create" ? "Request details" : "Edit request"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Create a draft request with the core details your manager needs."
                : `Update editable fields for ${request?.requestNumber ?? "this request"}.`}
            </CardDescription>
          </div>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/employee/requests"
          >
              <ArrowLeft data-icon="inline-start" />
              My requests
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Unable to save request</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert>
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>{successMessage}</AlertTitle>
            <AlertDescription>
              The latest request details are now saved.
            </AlertDescription>
          </Alert>
        ) : null}

        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => onSubmit(values, setError))}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <RequestTextField
              id="title"
              label="Title"
              error={errors.title?.message}
            >
              <Input
                id="title"
                aria-invalid={Boolean(errors.title)}
                autoComplete="off"
                placeholder="GitHub Copilot access"
                {...register("title")}
              />
            </RequestTextField>

            <RequestTextField
              id="priority"
              label="Priority"
              error={errors.priority?.message}
            >
              <select
                id="priority"
                aria-invalid={Boolean(errors.priority)}
                className={selectClassName}
                {...register("priority")}
              >
                {REQUEST_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {REQUEST_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </RequestTextField>
          </div>

          <RequestTextField
            id="category"
            label="Category"
            error={errors.category?.message}
          >
            <select
              id="category"
              aria-invalid={Boolean(errors.category)}
              className={selectClassName}
              {...register("category")}
            >
              {REQUEST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {REQUEST_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </RequestTextField>

          <RequestTextField
            id="description"
            label="Description"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              aria-invalid={Boolean(errors.description)}
              className="min-h-36 resize-y"
              placeholder="Share the business need, timing, and details that help with review."
              {...register("description")}
            />
          </RequestTextField>

          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/employee/requests"
            >
              Cancel
            </Link>
            <Button disabled={isPending || (mode === "edit" && !isDirty)} type="submit">
              <Save data-icon="inline-start" />
              {isPending ? pendingLabel : actionLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type RequestTextFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

function RequestTextField({
  id,
  label,
  error,
  children,
}: RequestTextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);
