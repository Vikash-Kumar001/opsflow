import {
  serializeComment,
  type CommentRecord,
  type SerializedComment,
} from "./comment.serializer.js";

export function serializeCommentResponse(comment: CommentRecord): {
  comment: SerializedComment;
} {
  return {
    comment: serializeComment(comment),
  };
}

export function serializeCommentListResponse(comments: CommentRecord[]): {
  comments: SerializedComment[];
} {
  return {
    comments: comments.map(serializeComment),
  };
}
