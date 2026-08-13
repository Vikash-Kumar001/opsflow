"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState, ErrorState, UserSummary } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/api-error";

import { useCreateRequestComment } from "../hooks/use-create-request-comment";
import { useRequestComments } from "../hooks/use-request-comments";
import {
  requestCommentSchema,
  type RequestCommentValues,
} from "../schemas/comment.schema";

type RequestCommentsProps = {
  requestId: string;
  emptyDescription?: string;
};

export function RequestComments({
  requestId,
  emptyDescription = "Add context or follow-up details for this request.",
}: RequestCommentsProps) {
  const commentsQuery = useRequestComments(requestId);
  const createComment = useCreateRequestComment();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<RequestCommentValues>({
    resolver: zodResolver(requestCommentSchema),
    defaultValues: { content: "" },
  });

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {commentsQuery.isLoading ? (
          <CommentSkeleton />
        ) : commentsQuery.isError ? (
          <ErrorState
            title="Comments unavailable"
            message="We could not load comments for this request."
            onRetry={() => void commentsQuery.refetch()}
          />
        ) : commentsQuery.data?.comments.length ? (
          <ol className="space-y-4" aria-label="Request comments">
            {commentsQuery.data.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <UserSummary user={comment.author} />
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={comment.createdAt}
                  >
                    {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {comment.content}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="No comments yet"
            description={emptyDescription}
            icon={MessageSquarePlus}
          />
        )}

        <form
          className="space-y-3 border-t pt-5"
          onSubmit={handleSubmit((values) => {
            setFormError(null);
            createComment.mutate(
              { requestId, payload: values },
              {
                onSuccess: () => {
                  reset({ content: "" });
                },
                onError: (error) => {
                  setFormError(
                    isApiError(error)
                      ? error.message
                      : "Unable to add comment. Please try again.",
                  );
                },
              },
            );
          })}
        >
          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to add comment</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="comment">Add comment</Label>
            <Textarea
              id="comment"
              aria-invalid={Boolean(errors.content)}
              className="min-h-24 resize-y"
              placeholder="Add a comment"
              {...register("content")}
            />
            {errors.content ? (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button disabled={createComment.isPending} type="submit">
              {createComment.isPending ? "Adding..." : "Add comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CommentSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading comments">
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}
