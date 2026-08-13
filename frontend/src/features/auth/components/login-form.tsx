"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isApiError } from "@/lib/api/api-error";

import { useLogin } from "../hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
  type LoginPayload,
} from "../schemas/login.schema";
import { DEMO_ACCOUNTS } from "../utils/demo-accounts";
import { resolvePostLoginRedirect } from "../utils/auth-redirects";

type LoginFormProps = {
  returnTo: string | null;
};

export function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginPayload) => {
    loginMutation.mutate(values, {
      onSuccess: (user) => {
        router.replace(resolvePostLoginRedirect(user, returnTo));
      },
    });
  };

  const applyDemoAccount = (account: LoginFormValues) => {
    setValue("email", account.email, { shouldDirty: true, shouldValidate: true });
    setValue("password", account.password, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const errorMessage = loginMutation.error
    ? getLoginErrorMessage(loginMutation.error)
    : null;

  return (
    <Card className="w-full max-w-md rounded-lg shadow-sm" data-testid="login-form">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary">OpsFlow</Badge>
          <span className="text-xs font-medium text-muted-foreground">
            Secure workspace
          </span>
        </div>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Use your OpsFlow account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Unable to sign in</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              placeholder="name@opsflow.demo"
              type="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                className="pr-10"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <Button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-1 -translate-y-1/2"
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            className="h-10 w-full"
            disabled={loginMutation.isPending}
            type="submit"
          >
            <LogIn data-icon="inline-start" />
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Demo accounts
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.role}
                type="button"
                variant="outline"
                onClick={() => applyDemoAccount(account)}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getLoginErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  return "Please try again.";
}
