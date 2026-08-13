import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <section className="w-full max-w-md border-l-2 border-zinc-300 bg-white p-6">
        <p className="text-sm font-semibold text-muted-foreground">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
          You do not have permission to access this page.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Return to your dashboard and continue from an area available to your
          role.
        </p>
        <Button className="mt-5" render={<Link href="/dashboard" />}>
          Return to dashboard
        </Button>
      </section>
    </main>
  );
}
