"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isApiError } from "@/lib/api/api-error";

import { useChangePassword } from "../hooks/use-change-password";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "../schemas/change-password.schema";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const changePasswordMutation = useChangePassword();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setFormError(null);
      setSuccessMessage(null);
    }

    onOpenChange(nextOpen);
  }

  async function onSubmit(values: ChangePasswordValues) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setFormError(null);
      setSuccessMessage("Your password has been changed.");
    } catch (error) {
      setSuccessMessage(null);
      setFormError(
        isApiError(error)
          ? error.message
          : "Unable to change your password. Please try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to change password</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4">
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              disabled={changePasswordMutation.isPending}
              registration={register("currentPassword")}
            />
            <PasswordField
              label="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              disabled={changePasswordMutation.isPending}
              registration={register("newPassword")}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              disabled={changePasswordMutation.isPending}
              registration={register("confirmPassword")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={changePasswordMutation.isPending}
            >
              Close
            </Button>
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending
                ? "Changing password..."
                : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type PasswordFieldProps = {
  label: string;
  autoComplete: "current-password" | "new-password";
  error?: string;
  disabled: boolean;
  registration: UseFormRegisterReturn;
};

function PasswordField({
  label,
  autoComplete,
  error,
  disabled,
  registration,
}: PasswordFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={registration.name}>{label}</Label>
      <Input
        id={registration.name}
        type="password"
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${registration.name}-error` : undefined}
        {...registration}
      />
      {error ? (
        <p id={`${registration.name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
