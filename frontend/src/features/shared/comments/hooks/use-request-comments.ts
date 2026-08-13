"use client";

import { useQuery } from "@tanstack/react-query";

import { listRequestComments } from "../services/comment.service";
import { requestCommentQueryKeys } from "./request-comment-query-keys";

export function useRequestComments(requestId: string) {
  return useQuery({
    queryKey: requestCommentQueryKeys.byRequest(requestId),
    queryFn: () => listRequestComments(requestId),
    enabled: Boolean(requestId),
  });
}
