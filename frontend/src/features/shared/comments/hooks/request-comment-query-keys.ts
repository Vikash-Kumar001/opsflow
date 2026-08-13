export const requestCommentQueryKeys = {
  all: ["requests", "comments"] as const,
  byRequest: (requestId: string) =>
    [...requestCommentQueryKeys.all, requestId] as const,
};
