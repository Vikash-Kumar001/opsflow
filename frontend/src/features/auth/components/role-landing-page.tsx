import type { Role } from "../types/auth.types";
import { EmptyState, PageHeader, StatCard } from "@/components/shared";

type RoleLandingPageProps = {
  role: Role;
  title: string;
};

export function RoleLandingPage({ role, title }: RoleLandingPageProps) {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow={`${role.toLowerCase()} workspace`}
        title={title}
        description="The protected shell, route guard, role navigation, and session menu are active. Domain dashboard data will be connected in the upcoming feature prompts."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Route guard"
          value="Active"
          description={`Reserved for ${role.toLowerCase()} users`}
        />
        <StatCard
          label="Navigation"
          value="Scoped"
          description="Sidebar links are permission-filtered"
        />
        <StatCard
          label="Authorization"
          value="Server-led"
          description="Backend permissions remain authoritative"
        />
      </div>

      <EmptyState
        title="Dashboard widgets are ready for data"
        description="Shared page, state, table, badge, timeline, and request metadata components are available for the next product screens."
      />
    </section>
  );
}
