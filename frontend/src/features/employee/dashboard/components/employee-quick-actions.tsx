import Link from "next/link";
import { FilePlus2Icon, ListChecksIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmployeeQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Start or review your request workflow.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Link
          className={buttonVariants({ className: "justify-start" })}
          href="/employee/requests/new"
        >
          <FilePlus2Icon aria-hidden="true" />
          New request
        </Link>
        <Link
          className={buttonVariants({
            variant: "outline",
            className: "justify-start",
          })}
          href="/employee/requests"
        >
          <ListChecksIcon aria-hidden="true" />
          View my requests
        </Link>
      </CardContent>
    </Card>
  );
}
