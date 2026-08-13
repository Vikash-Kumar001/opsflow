import { describe, expect, it } from "vitest";

import { InvalidTransitionError } from "../../../../src/errors/invalid-transition.error.js";
import {
  assertRequestStatusTransition,
  canTransitionRequestStatus,
  getValidRequestTransitions,
} from "../../../../src/domain/request/request-transitions.js";
import {
  isEmployeeCancellableRequestStatus,
  isEmployeeEditableRequestStatus,
  isReviewableRequestStatus,
  isTerminalRequestStatus,
} from "../../../../src/domain/request/request-status.js";

describe("request workflow rules", () => {
  it("allows canonical lifecycle transitions", () => {
    expect(canTransitionRequestStatus("DRAFT", "PENDING")).toBe(true);
    expect(canTransitionRequestStatus("DRAFT", "CANCELLED")).toBe(true);
    expect(canTransitionRequestStatus("PENDING", "IN_REVIEW")).toBe(true);
    expect(canTransitionRequestStatus("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionRequestStatus("IN_REVIEW", "APPROVED")).toBe(true);
    expect(canTransitionRequestStatus("IN_REVIEW", "REJECTED")).toBe(true);
  });

  it("blocks illegal and terminal-state transitions", () => {
    expect(canTransitionRequestStatus("APPROVED", "PENDING")).toBe(false);
    expect(canTransitionRequestStatus("REJECTED", "DRAFT")).toBe(false);
    expect(canTransitionRequestStatus("CANCELLED", "PENDING")).toBe(false);
    expect(canTransitionRequestStatus("PENDING", "APPROVED")).toBe(false);
  });

  it("throws a domain error for invalid transitions", () => {
    expect(() => assertRequestStatusTransition("APPROVED", "DRAFT")).toThrow(
      InvalidTransitionError,
    );
  });

  it("exposes valid transition choices for a status", () => {
    expect(getValidRequestTransitions("IN_REVIEW")).toEqual([
      "APPROVED",
      "REJECTED",
    ]);
    expect(getValidRequestTransitions("APPROVED")).toEqual([]);
  });

  it("classifies request states for shared policies", () => {
    expect(isTerminalRequestStatus("APPROVED")).toBe(true);
    expect(isTerminalRequestStatus("IN_REVIEW")).toBe(false);
    expect(isEmployeeEditableRequestStatus("DRAFT")).toBe(true);
    expect(isEmployeeEditableRequestStatus("IN_REVIEW")).toBe(false);
    expect(isEmployeeCancellableRequestStatus("PENDING")).toBe(true);
    expect(isReviewableRequestStatus("PENDING")).toBe(true);
    expect(isReviewableRequestStatus("DRAFT")).toBe(false);
  });
});
