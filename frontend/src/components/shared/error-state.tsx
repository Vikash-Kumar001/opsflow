import type { ReactNode } from "react";
import { AlertCircleIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  retryLabel = "Try again",
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry || action ? (
        <AlertAction>
          {action ?? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
        </AlertAction>
      ) : null}
    </Alert>
  );
}
