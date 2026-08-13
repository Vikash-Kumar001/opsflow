declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: import("../serializers/shared/user-summary.serializer.js").SerializedUserSummary;
      validatedQuery?: unknown;
    }
  }
}

export {};
