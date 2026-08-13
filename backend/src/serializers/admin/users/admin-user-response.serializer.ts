import { serializePagination } from "../../../serializers/shared/pagination.serializer.js";
import {
  serializeUserSummary,
  type SerializedUserSummary,
  type UserSummaryRecord,
} from "../../../serializers/shared/user-summary.serializer.js";
import type { PaginationMeta } from "../../../utils/pagination.js";

export function serializeAdminUserResponse(user: UserSummaryRecord): {
  user: SerializedUserSummary;
} {
  return {
    user: serializeUserSummary(user),
  };
}

export function serializeAdminUserListResponse(
  users: UserSummaryRecord[],
  pagination: PaginationMeta,
): {
  users: SerializedUserSummary[];
  pagination: PaginationMeta;
} {
  return {
    users: users.map(serializeUserSummary),
    pagination: serializePagination(pagination),
  };
}
