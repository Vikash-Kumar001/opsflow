"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/api-error";

import {
  managerReviewNotesSchema,
  type ManagerReviewNotesValues,
} from "../schemas/manager-review.schema";

type ReviewNotesDialogProps = {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (values: ManagerReviewNotesValues) => Promise<void>;
};

export function ReviewNotesDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  onSubmit,
}: ReviewNotesDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ManagerReviewNotesValues>({
    resolver: zodResolver(managerReviewNotesSchema),
    defaultValues: { reviewNotes: "" },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          reset({ reviewNotes: "" });
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
            } catch (error) {
              setFormError(
                isApiError(error)
                  ? error.message
                  : "Unable to update this request. Please try again.",
              );
            }
          })}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to update request</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reviewNotes">Review notes</Label>
            <Textarea
              id="reviewNotes"
              aria-invalid={Boolean(errors.reviewNotes)}
              className="min-h-28 resize-y"
              placeholder="Optional notes for this review"
              {...register("reviewNotes")}
            />
            {errors.reviewNotes ? (
              <p className="text-sm text-destructive">
                {errors.reviewNotes.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Notes are optional and visible in the request review context.
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
