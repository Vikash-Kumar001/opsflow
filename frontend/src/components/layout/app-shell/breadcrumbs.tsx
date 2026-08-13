import Link from "next/link";

import { cn } from "@/lib/utils";

type BreadcrumbsProps = {
  pathname: string;
};

export function Breadcrumbs({ pathname }: BreadcrumbsProps) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link className="hover:text-foreground" href="/dashboard">
            Dashboard
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isCurrent = index === segments.length - 1;

          if (index === 1 && segments[1] === "dashboard") {
            return null;
          }

          return (
            <li key={href} className="flex items-center gap-1">
              <span aria-hidden="true">/</span>
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={cn("capitalize", isCurrent && "text-foreground")}
                href={href}
              >
                {segment.replaceAll("-", " ")}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
