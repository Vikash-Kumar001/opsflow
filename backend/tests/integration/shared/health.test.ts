import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "5001";
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/opsflow";
  process.env.JWT_SECRET = "a-development-secret-that-is-long-enough";
  process.env.FRONTEND_ORIGIN = "http://localhost:3000";
});

describe("health route", () => {
  it("returns standard success response with request id", async () => {
    const { app } = await import("../../../src/app.js");

    const response = await request(app)
      .get("/api/v1/health")
      .set("x-request-id", "test-request-id")
      .expect(200);

    expect(response.headers["x-request-id"]).toBe("test-request-id");
    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok",
        service: "opsflow-api",
      },
      requestId: "test-request-id",
    });
  });

  it("returns standard error response for unknown routes", async () => {
    const { app } = await import("../../../src/app.js");

    const response = await request(app)
      .get("/api/v1/unknown")
      .set("x-request-id", "missing-route-request-id")
      .expect(404);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route not found: GET /api/v1/unknown",
      },
      requestId: "missing-route-request-id",
    });
  });
});
