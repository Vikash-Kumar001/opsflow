import type { AdminAuditLog } from "../types/admin-audit.types";
import { AUDIT_ACTION_LABELS } from "./admin-audit-labels";

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|credential/i;

export type MetadataLine = {
  label: string;
  value: string;
};

export function formatAuditTarget(event: AdminAuditLog): string {
  if (event.targetRequest) {
    return `${event.targetRequest.requestNumber} - ${event.targetRequest.title}`;
  }

  if (event.targetUser) {
    return `${event.targetUser.name} - ${event.targetUser.email}`;
  }

  if (event.targetComment) {
    return truncateText(event.targetComment.content, 64);
  }

  return "No specific resource";
}

export function buildAuditEventSummary(event: AdminAuditLog): string {
  const target = formatAuditTarget(event);

  if (event.action === "USER_ROLE_CHANGED") {
    const fromRole = readString(event.metadata, "fromRole");
    const toRole = readString(event.metadata, "toRole");

    if (fromRole && toRole) {
      return `Role changed from ${formatEnumValue(fromRole)} to ${formatEnumValue(
        toRole,
      )} for ${target}.`;
    }
  }

  if (
    event.action === "REQUEST_APPROVED" ||
    event.action === "REQUEST_REJECTED" ||
    event.action === "REQUEST_REVIEW_STARTED"
  ) {
    const fromStatus = readString(event.metadata, "fromStatus");
    const toStatus = readString(event.metadata, "toStatus");

    if (fromStatus && toStatus) {
      return `${AUDIT_ACTION_LABELS[event.action]} for ${target}, moving from ${formatEnumValue(
        fromStatus,
      )} to ${formatEnumValue(toStatus)}.`;
    }
  }

  if (event.action === "USER_ACTIVATED" || event.action === "USER_DEACTIVATED") {
    return `${AUDIT_ACTION_LABELS[event.action]} for ${target}.`;
  }

  return `${AUDIT_ACTION_LABELS[event.action]}${target ? ` for ${target}` : ""}.`;
}

export function buildSafeMetadataLines(
  metadata: Record<string, unknown> | null,
): MetadataLine[] {
  if (!metadata) {
    return [];
  }

  return Object.entries(metadata)
    .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
    .map(([key, value]) => ({
      label: formatMetadataKey(key),
      value: formatMetadataValue(value),
    }))
    .filter((line) => line.value.length > 0);
}

export function formatEnumValue(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readString(
  metadata: Record<string, unknown> | null,
  key: string,
): string | undefined {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}

function formatMetadataKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return formatLikelyEnumOrDate(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatMetadataValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, nestedValue]) => `${formatMetadataKey(key)}: ${formatMetadataValue(nestedValue)}`)
      .filter((line) => !line.endsWith(": "))
      .join("; ");
  }

  return "";
}

function formatLikelyEnumOrDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value;
  }

  if (/^[A-Z0-9_]+$/.test(value)) {
    return formatEnumValue(value);
  }

  return value;
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}
