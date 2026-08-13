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
  managerRejectRequestSchema,
  type ManagerRejectRequestValues,
} from "../schemas/manager-review.schema";

type RejectRequestDialogProps = {
  trigger: ReactElement;
  isPending: boolean;
  onSubmit: (values: ManagerRejectRequestValues) => Promise<void>;
};

export function RejectRequestDialog({
  trigger,
  isPending,
  onSubmit,
}: RejectRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ManagerRejectRequestValues>({
    resolver: zodResolver(managerRejectRequestSchema),
    defaultValues: { rejectionReason: "", reviewNotes: "" },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          reset({ rejectionReason: "", reviewNotes: "" });
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
                  : "Unable to reject this request. Please try again.",
              );
            }
          })}
        >
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
            <DialogDescription>
              Provide a clear reason so the requester understands the decision.
            </DialogDescription>
          </DialogHeader>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to reject request</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection reason</Label>
            <Textarea
              id="rejectionReason"
              aria-invalid={Boolean(errors.rejectionReason)}
              className="min-h-28 resize-y"
              placeholder="Explain why this request cannot be approved"
              {...register("rejectionReason")}
            />
            {errors.rejectionReason ? (
              <p className="text-sm text-destructive">
                {errors.rejectionReason.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejectReviewNotes">Review notes</Label>
            <Textarea
              id="rejectReviewNotes"
              aria-invalid={Boolean(errors.reviewNotes)}
              className="min-h-24 resize-y"
              placeholder="Optional internal review notes"
              {...register("reviewNotes")}
            />
            {errors.reviewNotes ? (
              <p className="text-sm text-destructive">
                {errors.reviewNotes.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button disabled={isPending} type="submit" variant="destructive">
              {isPending ? "Rejecting..." : "Reject request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
