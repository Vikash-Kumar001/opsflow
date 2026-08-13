import {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../../generated/prisma/enums.js";
import { requestIds } from "./demo-ids.js";
import type { SeedPrismaClient, SeedUsers } from "./types.js";

const day = 24 * 60 * 60 * 1000;
const baseDate = new Date("2026-08-12T09:00:00.000Z");

const requestTemplates = [
  [
    "REQ-1001",
    "GitHub Copilot Access",
    RequestCategory.SOFTWARE_ACCESS,
    RequestPriority.HIGH,
    RequestStatus.APPROVED,
    "employee",
    "manager",
    28,
  ],
  [
    "REQ-1002",
    "MacBook replacement keyboard",
    RequestCategory.EQUIPMENT,
    RequestPriority.MEDIUM,
    RequestStatus.PENDING,
    "priya",
    null,
    24,
  ],
  [
    "REQ-1003",
    "Client visit travel booking",
    RequestCategory.TRAVEL,
    RequestPriority.URGENT,
    RequestStatus.IN_REVIEW,
    "arjun",
    "manager",
    22,
  ],
  [
    "REQ-1004",
    "July broadband reimbursement",
    RequestCategory.EXPENSE,
    RequestPriority.LOW,
    RequestStatus.REJECTED,
    "employee",
    "manager",
    21,
  ],
  [
    "REQ-1005",
    "Work from home next Friday",
    RequestCategory.WORK_FROM_HOME,
    RequestPriority.MEDIUM,
    RequestStatus.CANCELLED,
    "priya",
    null,
    19,
  ],
  [
    "REQ-1006",
    "Annual leave for Diwali",
    RequestCategory.LEAVE,
    RequestPriority.MEDIUM,
    RequestStatus.DRAFT,
    "arjun",
    null,
    18,
  ],
  [
    "REQ-1007",
    "Figma enterprise seat",
    RequestCategory.SOFTWARE_ACCESS,
    RequestPriority.HIGH,
    RequestStatus.PENDING,
    "employee",
    null,
    17,
  ],
  [
    "REQ-1008",
    "External monitor purchase",
    RequestCategory.PROCUREMENT,
    RequestPriority.MEDIUM,
    RequestStatus.APPROVED,
    "priya",
    "manager",
    16,
  ],
  [
    "REQ-1009",
    "Conference expense advance",
    RequestCategory.EXPENSE,
    RequestPriority.URGENT,
    RequestStatus.IN_REVIEW,
    "arjun",
    "manager",
    15,
  ],
  [
    "REQ-1010",
    "Medical leave",
    RequestCategory.LEAVE,
    RequestPriority.HIGH,
    RequestStatus.APPROVED,
    "neha",
    "operationsManager",
    14,
  ],
  [
    "REQ-1011",
    "Replacement headset",
    RequestCategory.EQUIPMENT,
    RequestPriority.LOW,
    RequestStatus.PENDING,
    "kabir",
    null,
    13,
  ],
  [
    "REQ-1012",
    "VPN access for vendor portal",
    RequestCategory.SOFTWARE_ACCESS,
    RequestPriority.HIGH,
    RequestStatus.REJECTED,
    "ananya",
    "operationsManager",
    12,
  ],
  [
    "REQ-1013",
    "WFH for home repair",
    RequestCategory.WORK_FROM_HOME,
    RequestPriority.LOW,
    RequestStatus.APPROVED,
    "neha",
    "operationsManager",
    11,
  ],
  [
    "REQ-1014",
    "Procure test devices",
    RequestCategory.PROCUREMENT,
    RequestPriority.URGENT,
    RequestStatus.PENDING,
    "kabir",
    null,
    10,
  ],
  [
    "REQ-1015",
    "Train ticket reimbursement",
    RequestCategory.TRAVEL,
    RequestPriority.MEDIUM,
    RequestStatus.CANCELLED,
    "ananya",
    null,
    9,
  ],
  [
    "REQ-1016",
    "Quarterly planning travel",
    RequestCategory.TRAVEL,
    RequestPriority.HIGH,
    RequestStatus.APPROVED,
    "manager",
    "operationsManager",
    8,
  ],
  [
    "REQ-1017",
    "Team lunch reimbursement",
    RequestCategory.EXPENSE,
    RequestPriority.LOW,
    RequestStatus.PENDING,
    "operationsManager",
    null,
    7,
  ],
  [
    "REQ-1018",
    "Security training platform",
    RequestCategory.SOFTWARE_ACCESS,
    RequestPriority.MEDIUM,
    RequestStatus.IN_REVIEW,
    "neha",
    "operationsManager",
    6,
  ],
  [
    "REQ-1019",
    "Ergonomic chair",
    RequestCategory.EQUIPMENT,
    RequestPriority.MEDIUM,
    RequestStatus.DRAFT,
    "kabir",
    null,
    5,
  ],
  [
    "REQ-1020",
    "Two-day personal leave",
    RequestCategory.LEAVE,
    RequestPriority.LOW,
    RequestStatus.PENDING,
    "employee",
    null,
    4,
  ],
  [
    "REQ-1021",
    "Cloud sandbox budget",
    RequestCategory.PROCUREMENT,
    RequestPriority.URGENT,
    RequestStatus.APPROVED,
    "arjun",
    "manager",
    3,
  ],
  [
    "REQ-1022",
    "Airport cab reimbursement",
    RequestCategory.EXPENSE,
    RequestPriority.MEDIUM,
    RequestStatus.REJECTED,
    "priya",
    "manager",
    2,
  ],
  [
    "REQ-1023",
    "Design workshop travel",
    RequestCategory.TRAVEL,
    RequestPriority.HIGH,
    RequestStatus.PENDING,
    "ananya",
    null,
    1,
  ],
  [
    "REQ-1024",
    "Temporary payroll report access",
    RequestCategory.OTHER,
    RequestPriority.HIGH,
    RequestStatus.IN_REVIEW,
    "employee",
    "manager",
    0,
  ],
] as const;

export async function seedRequests(prisma: SeedPrismaClient, users: SeedUsers) {
  return Promise.all(
    requestTemplates.map((template, index) => {
      const [
        requestNumber,
        title,
        category,
        priority,
        status,
        creatorKey,
        reviewerKey,
        daysAgo,
      ] = template;
      const createdAt = new Date(baseDate.getTime() - daysAgo * day);
      const submittedAt =
        status === RequestStatus.DRAFT
          ? null
          : new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
      const reviewedAt =
        status === RequestStatus.APPROVED || status === RequestStatus.REJECTED
          ? new Date(createdAt.getTime() + 2 * day)
          : null;
      const reviewer = reviewerKey ? users[reviewerKey] : null;

      return prisma.request.upsert({
        where: { requestNumber },
        create: {
          id: requestIds[index],
          requestNumber,
          title,
          description: `Demo ${title.toLowerCase()} request for OpsFlow reviewer workflows.`,
          category,
          priority,
          status,
          createdById: users[creatorKey].id,
          reviewedById: reviewer?.id,
          reviewNotes: reviewer ? `Reviewed by ${reviewer.name}.` : null,
          rejectionReason:
            status === RequestStatus.REJECTED
              ? "Demo request rejected because the submitted details were incomplete."
              : null,
          metadata: buildMetadata(category, requestNumber),
          submittedAt,
          reviewedAt,
          createdAt,
        },
        update: {
          title,
          description: `Demo ${title.toLowerCase()} request for OpsFlow reviewer workflows.`,
          category,
          priority,
          status,
          createdById: users[creatorKey].id,
          reviewedById: reviewer?.id,
          reviewNotes: reviewer ? `Reviewed by ${reviewer.name}.` : null,
          rejectionReason:
            status === RequestStatus.REJECTED
              ? "Demo request rejected because the submitted details were incomplete."
              : null,
          metadata: buildMetadata(category, requestNumber),
          submittedAt,
          reviewedAt,
          deletedAt: null,
          createdAt,
        },
      });
    }),
  );
}

function buildMetadata(category: RequestCategory, requestNumber: string) {
  if (category === RequestCategory.EXPENSE) {
    return {
      amount: 4200,
      currency: "INR",
      receiptId: `${requestNumber}-RCPT`,
    };
  }

  if (category === RequestCategory.LEAVE) {
    return { startDate: "2026-09-02", endDate: "2026-09-04" };
  }

  if (category === RequestCategory.SOFTWARE_ACCESS) {
    return {
      softwareName: "Demo SaaS Tool",
      businessReason: "Assessment workflow coverage",
    };
  }

  return { demoRecord: true };
}
