import type { ReactNode } from "react";

import { ProtectedAppLayout } from "@/components/layout/protected/protected-app-layout";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <ProtectedAppLayout>{children}</ProtectedAppLayout>;
}
