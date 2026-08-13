import type { RequestUserSummary } from "@/features/shared/requests";

export type RequestComment = {
  id: string;
  requestId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: RequestUserSummary;
};

export type RequestCommentsData = {
  comments: RequestComment[];
};

export type RequestCommentData = {
  comment: RequestComment;
};

export type RequestCommentPayload = {
  content: string;
};
