"use client";

import { FilterToolbar, SearchInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AdminAuditFilterSelect } from "./admin-audit-filter-select";
import {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_AUDIT_ENTITY_TYPES,
  type AdminAuditListParams,
} from "../types/admin-audit.types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from "../utils/admin-audit-labels";

type AdminAuditListFiltersProps = {
  params: AdminAuditListParams;
  searchDraft: string;
  isSearching?: boolean;
  actorIdDraft: string;
  targetUserIdDraft: string;
  targetRequestIdDraft: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onActorIdChange: (value: string) => void;
  onTargetUserIdChange: (value: string) => void;
  onTargetRequestIdChange: (value: string) => void;
  onApplyIdFilters: () => void;
  onParamsChange: (params: Partial<AdminAuditListParams>) => void;
  onClearFilters: () => void;
};

export function AdminAuditListFilters({
  params,
  searchDraft,
  isSearching = false,
  actorIdDraft,
  targetUserIdDraft,
  targetRequestIdDraft,
  hasActiveFilters,
  onSearchChange,
  onActorIdChange,
  onTargetUserIdChange,
  onTargetRequestIdChange,
  onApplyIdFilters,
  onParamsChange,
  onClearFilters,
}: AdminAuditListFiltersProps) {
  return (
    <FilterToolbar
      className="sm:flex-col sm:items-stretch"
      search={
        <div className="grid w-full gap-3">
          <SearchInput
            value={searchDraft}
            onChange={onSearchChange}
            label="Search audit logs"
            placeholder="Search action, actor, metadata, or request"
            isLoading={isSearching}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminAuditFilterSelect
              className="min-w-0"
              label="Action"
              value={params.action ?? ""}
              options={ADMIN_AUDIT_ACTIONS.map((action) => ({
                value: action,
                label: AUDIT_ACTION_LABELS[action],
              }))}
              onChange={(action) => onParamsChange({ action, page: 1 })}
            />
            <AdminAuditFilterSelect
              className="min-w-0"
              label="Entity"
              value={params.entityType ?? ""}
              options={ADMIN_AUDIT_ENTITY_TYPES.map((entityType) => ({
                value: entityType,
                label: AUDIT_ENTITY_LABELS[entityType],
              }))}
              onChange={(entityType) => onParamsChange({ entityType, page: 1 })}
            />
            <DateFilter
              label="From"
              value={params.createdFrom?.slice(0, 10) ?? ""}
              onChange={(createdFrom) =>
                onParamsChange({ createdFrom, page: 1 })
              }
            />
            <DateFilter
              label="To"
              value={params.createdTo?.slice(0, 10) ?? ""}
              onChange={(createdTo) => onParamsChange({ createdTo, page: 1 })}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-end">
            <IdFilter
              label="Actor ID"
              value={actorIdDraft}
              onChange={onActorIdChange}
            />
            <IdFilter
              label="Target user ID"
              value={targetUserIdDraft}
              onChange={onTargetUserIdChange}
            />
            <IdFilter
              label="Target request ID"
              value={targetRequestIdDraft}
              onChange={onTargetRequestIdChange}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full xl:w-auto"
              onClick={onApplyIdFilters}
            >
              Apply IDs
            </Button>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                className="w-full xl:w-auto"
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>
      }
    />
  );
}

type DateFilterProps = {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
};

function DateFilter({ label, value, onChange }: DateFilterProps) {
  return (
    <Label className="grid min-w-0 gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
              ? `${event.target.value}T${
                  label === "To" ? "23:59:59.999" : "00:00:00.000"
                }Z`
              : undefined,
          )
        }
      />
    </Label>
  );
}

type IdFilterProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function IdFilter({ label, value, onChange }: IdFilterProps) {
  return (
    <Label className="grid min-w-0 gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        className="h-8 w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="UUID"
      />
    </Label>
  );
}
