"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  BadgeCheckIcon,
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  MailIcon,
  UserRoundIcon,
} from "lucide-react";

import { ErrorState, PageHeader, UserSummary } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

import { EmployeeProfileSkeleton } from "./employee-profile-skeleton";

export function EmployeeProfile() {
  const currentUserQuery = useCurrentUser();

  if (currentUserQuery.isLoading) {
    return <EmployeeProfileSkeleton />;
  }

  if (currentUserQuery.isError) {
    return (
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader
          eyebrow="Employee workspace"
          title="Profile"
          description="Review your account identity and role assignment."
        />
        <ErrorState
          message={currentUserQuery.error.message}
          onRetry={() => void currentUserQuery.refetch()}
        />
      </section>
    );
  }

  const user = currentUserQuery.data;

  if (!user) {
    return (
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader
          eyebrow="Employee workspace"
          title="Profile"
          description="Review your account identity and role assignment."
        />
        <ErrorState message="Your session has expired. Please sign in again." />
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Employee workspace"
        title="Profile"
        description="Review your account identity and role assignment."
        actions={
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/employee/requests"
          >
            My requests
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <UserSummary
                user={{
                  name: user.name,
                  email: user.email,
                  role: "Employee",
                }}
                size="lg"
              />
              <Badge variant={user.isActive ? "outline" : "destructive"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ProfileField
              icon={UserRoundIcon}
              label="Name"
              value={user.name}
            />
            <ProfileField icon={MailIcon} label="Email" value={user.email} />
            <ProfileField
              icon={BriefcaseBusinessIcon}
              label="Role"
              value="Employee"
            />
            <ProfileField
              icon={CalendarDaysIcon}
              label="Member since"
              value={format(new Date(user.createdAt), "MMM d, yyyy")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access</CardTitle>
            <CardDescription>
              Your current account scope in OpsFlow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <BadgeCheckIcon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Employee request access
                </p>
                <p className="text-sm text-muted-foreground">
                  You can create and manage your own requests.
                </p>
              </div>
            </div>
            {user.managerId ? (
              <p className="text-sm text-muted-foreground">
                Your account is assigned to a manager for request review.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No manager assignment is currently visible on your account.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

type ProfileFieldProps = {
  icon: typeof UserRoundIcon;
  label: string;
  value: string;
};

function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex min-w-0 gap-3 rounded-lg border bg-muted/30 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
