"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

import {
  createAdminUserSchema,
  type CreateAdminUserValues,
} from "../schemas/admin-user.schema";
import { ADMIN_USER_ROLES } from "../types/admin-user.types";
import { ADMIN_USER_ROLE_LABELS } from "../utils/admin-user-labels";

type CreateAdminUserDialogProps = {
  trigger: ReactElement;
  isPending: boolean;
  onSubmit: (values: CreateAdminUserValues) => Promise<void>;
};

export function CreateAdminUserDialog({
  trigger,
  isPending,
  onSubmit,
}: CreateAdminUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateAdminUserValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      isActive: true,
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          reset();
          setFormError(null);
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setFormError(null);

            try {
              await onSubmit(values);
              setOpen(false);
              reset();
            } catch (error) {
              setFormError(
                isApiError(error)
                  ? error.message
                  : "Unable to create this user. Please try again.",
              );
            }
          })}
        >
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Add a demo-ready OpsFlow user with a server-hashed password.
            </DialogDescription>
          </DialogHeader>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to create user</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <AdminUserTextField id="name" label="Name" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              placeholder="Priya Shah"
              {...register("name")}
            />
          </AdminUserTextField>

          <AdminUserTextField
            id="email"
            label="Email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              placeholder="priya@opsflow.demo"
              {...register("email")}
            />
          </AdminUserTextField>

          <AdminUserTextField
            id="password"
            label="Temporary password"
            error={errors.password?.message}
          >
            <Input
              id="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              type="password"
              placeholder="Minimum 8 characters"
              {...register("password")}
            />
          </AdminUserTextField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminUserTextField
              id="role"
              label="Role"
              error={errors.role?.message}
            >
              <select id="role" className={selectClassName} {...register("role")}>
                {ADMIN_USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ADMIN_USER_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </AdminUserTextField>

            <Label className="grid content-start gap-2 pt-1 text-sm">
              <span>Status</span>
              <span className="flex h-8 items-center gap-2">
                <input
                  className="size-4 accent-primary"
                  type="checkbox"
                  {...register("isActive")}
                />
                Active account
              </span>
            </Label>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type AdminUserTextFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

function AdminUserTextField({
  id,
  label,
  error,
  children,
}: AdminUserTextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);
