import { describe, expect, it } from "vitest";
import { ApiError } from "./api";
import { isAuthenticationFailure } from "./useAuth";

describe("isAuthenticationFailure", () => {
  it("classifies unauthorized and forbidden responses as destructive auth failures", () => {
    expect(isAuthenticationFailure(new ApiError("expired", 401))).toBe(true);
    expect(isAuthenticationFailure(new ApiError("forbidden", 403))).toBe(true);
  });

  it("keeps timeout, server, and network errors retryable", () => {
    expect(isAuthenticationFailure(new ApiError("timed out", 0))).toBe(false);
    expect(isAuthenticationFailure(new ApiError("server error", 500))).toBe(false);
    expect(isAuthenticationFailure(new TypeError("offline"))).toBe(false);
  });
});
