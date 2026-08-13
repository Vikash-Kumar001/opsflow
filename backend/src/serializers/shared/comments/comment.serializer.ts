import {
  serializeUserSummary,
  type SerializedUserSummary,
  type UserSummaryRecord,
  userSummarySelect,
} from "../user-summary.serializer.js";

export const commentSelect = {
  id: true,
  requestId: true,
  authorId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: userSummarySelect,
  },
} as const;

export type CommentRecord = {
  id: string;
  requestId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: UserSummaryRecord;
};

export type SerializedComment = {
  id: string;
  requestId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: SerializedUserSummary;
};

export function serializeComment(comment: CommentRecord): SerializedComment {
  return {
    id: comment.id,
    requestId: comment.requestId,
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: serializeUserSummary(comment.author),
  };
}
