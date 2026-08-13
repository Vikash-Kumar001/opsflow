import { Badge } from "@/components/ui/badge";

import type {
  AdminAuditAction,
  AdminAuditEntityType,
} from "../types/admin-audit.types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_TONE,
  AUDIT_ENTITY_LABELS,
} from "../utils/admin-audit-labels";

type AuditActionBadgeProps = {
  action: AdminAuditAction;
};

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  return (
    <Badge variant={AUDIT_ACTION_TONE[action]}>
      {AUDIT_ACTION_LABELS[action]}
    </Badge>
  );
}

type AuditEntityBadgeProps = {
  entityType: AdminAuditEntityType;
};

export function AuditEntityBadge({ entityType }: AuditEntityBadgeProps) {
  return <Badge variant="outline">{AUDIT_ENTITY_LABELS[entityType]}</Badge>;
}
