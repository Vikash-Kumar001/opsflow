export const userIds = {
  admin: "11111111-1111-4111-8111-111111111111",
  manager: "22222222-2222-4222-8222-222222222222",
  operationsManager: "33333333-3333-4333-8333-333333333333",
  employee: "44444444-4444-4444-8444-444444444444",
  priya: "55555555-5555-4555-8555-555555555555",
  arjun: "66666666-6666-4666-8666-666666666666",
  neha: "77777777-7777-4777-8777-777777777777",
  kabir: "88888888-8888-4888-8888-888888888888",
  ananya: "99999999-9999-4999-8999-999999999999",
} as const;

export const requestIds = Array.from(
  { length: 24 },
  (_, index) =>
    `aaaaaaaa-aaaa-4aaa-8aaa-${String(index + 1).padStart(12, "0")}`,
);

export const commentIds = Array.from(
  { length: 14 },
  (_, index) =>
    `bbbbbbbb-bbbb-4bbb-8bbb-${String(index + 1).padStart(12, "0")}`,
);

export const auditIds = Array.from(
  { length: 34 },
  (_, index) =>
    `cccccccc-cccc-4ccc-8ccc-${String(index + 1).padStart(12, "0")}`,
);
