import {
  commentSelect,
  type CommentRecord,
} from "../../../serializers/shared/comments/comment.serializer.js";

export type CommentCreateInput = {
  requestId: string;
  authorId: string;
  content: string;
};

type CommentDelegate = {
  findMany(args: {
    where: { requestId: string };
    orderBy: { createdAt: "asc" };
    select: typeof commentSelect;
  }): Promise<CommentRecord[]>;
  create(args: {
    data: CommentCreateInput;
    select: typeof commentSelect;
  }): Promise<CommentRecord>;
};

export type CommentRepositoryClient = {
  comment: CommentDelegate;
};

export async function listCommentsForRequest(
  prisma: CommentRepositoryClient,
  requestId: string,
): Promise<CommentRecord[]> {
  return prisma.comment.findMany({
    where: {
      requestId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: commentSelect,
  });
}

export async function createCommentRecord(
  prisma: CommentRepositoryClient,
  input: CommentCreateInput,
): Promise<CommentRecord> {
  return prisma.comment.create({
    data: input,
    select: commentSelect,
  });
}
