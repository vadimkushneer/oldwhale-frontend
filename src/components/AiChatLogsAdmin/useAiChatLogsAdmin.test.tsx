import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import type { User } from "../../api/types";
import { authSlice } from "../../features/auth/authSlice";
import { useAiChatLogsAdmin } from "./useAiChatLogsAdmin";

vi.mock("../../features/admin/adminApi", () => ({
  useLazyGetAdminUiSettingsQuery: vi.fn(() => {
    const trigger = vi.fn(() => ({
      unwrap: () => Promise.resolve({ aiChatLogTable: { columns: {} } }),
    }));
    return [trigger];
  }),
  usePutAdminUiSettingsMutation: vi.fn(() => [
    vi.fn(() => ({
      unwrap: () =>
        Promise.resolve({ aiChatLogTable: { columns: {}, updated_at: null as string | null } }),
    })),
  ]),
  useListAiChatLogsQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  })),
}));

vi.mock("../../hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(() => true),
}));

function wrapperForAuth(
  token: string | null,
  user: User | null,
  restoreStatus: "idle" | "restoring" | "ready",
) {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: {
      auth: {
        token,
        user,
        restoreStatus,
        loginLoading: false,
        registerLoading: false,
        lastError: null,
        sessionExpired: false,
      },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
}

const adminUser: User = {
  id: 1,
  login: "a",
  email: "a@b.com",
  role: "admin",
  disabled: false,
  credits: 300,
  created_at: "",
};

describe("useAiChatLogsAdmin", () => {
  it("returns redirect-login when no token", () => {
    const { result } = renderHook(() => useAiChatLogsAdmin(), {
      wrapper: wrapperForAuth(null, null, "ready"),
    });
    expect(result.current.phase).toBe("redirect-login");
  });

  it("returns forbidden for non-admin", () => {
    const userUser: User = { ...adminUser, role: "user" };
    const { result } = renderHook(() => useAiChatLogsAdmin(), {
      wrapper: wrapperForAuth("tok", userUser, "ready"),
    });
    expect(result.current.phase).toBe("forbidden");
  });

  it("returns ready with rows for admin", () => {
    const { result } = renderHook(() => useAiChatLogsAdmin(), {
      wrapper: wrapperForAuth("tok", adminUser, "ready"),
    });
    expect(result.current.phase).toBe("ready");
    if (result.current.phase === "ready") {
      expect(result.current.rows).toEqual([]);
    }
  });
});
