import { describe, expect, it } from "vitest";
import type { AuthState } from "./authSlice";
import { acknowledgeSessionExpired, authSlice, restoreSession } from "./authSlice";

function buildAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    token: "jwt",
    user: null,
    restoreStatus: "restoring",
    loginLoading: false,
    registerLoading: false,
    lastError: null,
    sessionExpired: false,
    ...overrides,
  };
}

describe("authSlice", () => {
  it("marks the session expired when /api/me returns 401", () => {
    localStorage.setItem("ow_token", "jwt");

    const state = authSlice.reducer(
      buildAuthState(),
      restoreSession.rejected(null, "restore", undefined, { unauthorized: true }),
    );

    expect(state).toMatchObject({
      token: null,
      user: null,
      restoreStatus: "ready",
      sessionExpired: true,
    });
    expect(localStorage.getItem("ow_token")).toBeNull();
  });

  it("clears the session expired redirect marker after it is consumed", () => {
    const state = authSlice.reducer(
      buildAuthState({ sessionExpired: true }),
      acknowledgeSessionExpired(),
    );

    expect(state.sessionExpired).toBe(false);
  });
});
