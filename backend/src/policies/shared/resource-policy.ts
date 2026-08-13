import type { SerializedUserSummary } from "../../serializers/shared/user-summary.serializer.js";

export type ResourcePolicyContext<TResource> = {
  actor: SerializedUserSummary;
  resource: TResource;
};

export type ResourcePolicy<TResource> = (
  context: ResourcePolicyContext<TResource>,
) => boolean | Promise<boolean>;

export type OwnedResource = {
  createdById: string;
};

export type TeamScopedResource = {
  requester: {
    managerId: string | null;
  };
};

export function canAccessOwnResource(
  context: ResourcePolicyContext<OwnedResource>,
): boolean {
  return context.resource.createdById === context.actor.id;
}

export function canAccessTeamResource(
  context: ResourcePolicyContext<TeamScopedResource>,
): boolean {
  return context.resource.requester.managerId === context.actor.id;
}

export async function evaluateResourcePolicy<TResource>(
  policy: ResourcePolicy<TResource>,
  context: ResourcePolicyContext<TResource>,
): Promise<boolean> {
  return Boolean(await policy(context));
}
