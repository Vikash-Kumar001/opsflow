"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRequestComment } from "../services/comment.service";
import type { RequestCommentPayload } from "../types/comment.types";
import { requestCommentQueryKeys } from "./request-comment-query-keys";

type CreateRequestCommentVariables = {
  requestId: string;
  payload: RequestCommentPayload;
};

export function useCreateRequestComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: CreateRequestCommentVariables) =>
      createRequestComment(requestId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: requestCommentQueryKeys.byRequest(variables.requestId),
      });
    },
  });
}
