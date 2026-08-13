import { commentIds } from "./demo-ids.js";
import type {
  SeedComment,
  SeedPrismaClient,
  SeedRequest,
  SeedUsers,
} from "./types.js";

const commentTemplates = [
  [0, "employee", "Submitted with business justification and team impact."],
  [0, "manager", "Approved for the pilot group."],
  [2, "arjun", "Travel dates are flexible if costs change."],
  [2, "manager", "Reviewing budget alignment before approval."],
  [
    3,
    "manager",
    "Please attach the missing provider invoice before resubmitting.",
  ],
  [7, "priya", "This monitor will be used for the analytics dashboard work."],
  [9, "neha", "Medical certificate uploaded in the HR system."],
  [11, "operationsManager", "Vendor access requires additional justification."],
  [13, "kabir", "Procurement quote shared with operations."],
  [17, "operationsManager", "Security training seats are being reviewed."],
  [
    20,
    "manager",
    "Approved because the sandbox is required for delivery testing.",
  ],
  [21, "priya", "Reimbursement details updated after finance review."],
  [22, "ananya", "Workshop agenda is attached in the planning doc."],
  [23, "employee", "Temporary access requested for month-end reporting."],
] as const;

export async function seedComments(
  prisma: SeedPrismaClient,
  users: SeedUsers,
  requests: SeedRequest[],
): Promise<SeedComment[]> {
  return Promise.all(
    commentTemplates.map(([requestIndex, authorKey, content], index) => {
      const request = requests[requestIndex];
      const author = users[authorKey];

      return prisma.comment.upsert({
        where: { id: commentIds[index] },
        create: {
          id: commentIds[index],
          requestId: request.id,
          authorId: author.id,
          content,
        },
        update: {
          requestId: request.id,
          authorId: author.id,
          content,
        },
      });
    }),
  );
}
