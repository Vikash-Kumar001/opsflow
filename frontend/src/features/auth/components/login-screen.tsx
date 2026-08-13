"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isApiError } from "@/lib/api/api-error";

import { useCurrentUser } from "../hooks/use-current-user";
import { getSafeReturnTo, resolvePostLoginRedirect } from "../utils/auth-redirects";
import { AuthLoadingState } from "./auth-loading-state";
import { LoginForm } from "./login-form";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    if (currentUserQuery.data) {
      router.replace(resolvePostLoginRedirect(currentUserQuery.data, returnTo));
    }
  }, [currentUserQuery.data, returnTo, router]);

  if (currentUserQuery.isLoading) {
    return <AuthLoadingState />;
  }

  if (currentUserQuery.data) {
    return <AuthLoadingState />;
  }

  const restoreError = currentUserQuery.error;

  return (
    <main className="min-h-screen bg-zinc-50 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-normal text-zinc-500">
                Team request operations
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
                OpsFlow
              </h1>
              <p className="max-w-xl text-base leading-7 text-zinc-600">
                A focused workspace for employee requests, manager approvals,
                and administrative oversight.
              </p>
            </div>

            <div className="grid max-w-xl gap-3 text-sm text-zinc-700 sm:grid-cols-3">
              <div className="border-l-2 border-zinc-300 pl-3">
                <p className="font-medium text-zinc-950">Employees</p>
                <p>Draft and track requests.</p>
              </div>
              <div className="border-l-2 border-zinc-300 pl-3">
                <p className="font-medium text-zinc-950">Managers</p>
                <p>Review scoped team work.</p>
              </div>
              <div className="border-l-2 border-zinc-300 pl-3">
                <p className="font-medium text-zinc-950">Admins</p>
                <p>Manage access and audit history.</p>
              </div>
            </div>

            {restoreError && !isApiError(restoreError) ? (
              <Alert>
                <AlertTitle>Session check unavailable</AlertTitle>
                <AlertDescription>
                  You can still sign in. OpsFlow will retry with the backend
                  when credentials are submitted.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </section>

        <section className="flex items-center justify-center border-t bg-white px-4 py-8 sm:px-6 lg:border-t-0 lg:border-l">
          <LoginForm returnTo={returnTo} />
        </section>
      </div>
    </main>
  );
}
