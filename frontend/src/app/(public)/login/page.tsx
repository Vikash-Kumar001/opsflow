import { Suspense } from "react";

import { AuthLoadingState } from "@/features/auth/components/auth-loading-state";
import { LoginScreen } from "@/features/auth/components/login-screen";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingState />}>
      <LoginScreen />
    </Suspense>
  );
}
