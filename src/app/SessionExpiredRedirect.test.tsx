import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { acknowledgeSessionExpired } from "../features/auth/authSlice";
import { SessionExpiredRedirect } from "./SessionExpiredRedirect";

type AuthState = {
  sessionExpired: boolean;
};

const authStateRef = vi.hoisted(() => ({
  current: {
    sessionExpired: false,
  } as AuthState,
}));

const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: { auth: AuthState }) => unknown) =>
    selector({ auth: authStateRef.current }),
}));

function LocationProbe() {
  const location = useLocation() as {
    pathname: string;
    search: string;
    hash: string;
    state?: unknown;
  };

  return (
    <pre data-testid="location">
      {JSON.stringify({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        state: location.state ?? null,
      })}
    </pre>
  );
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionExpiredRedirect />
      <LocationProbe />
      <Routes>
        <Route path="/editor/:modeName" element={<div>Editor</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function readLocation() {
  return JSON.parse(screen.getByTestId("location").textContent || "{}") as {
    pathname: string;
    search: string;
    hash: string;
    state?: { from?: { pathname?: string; search?: string; hash?: string } } | null;
  };
}

beforeEach(() => {
  authStateRef.current = {
    sessionExpired: false,
  };
  dispatchMock.mockReset();
  dispatchMock.mockImplementation((action) => {
    if (action.type === acknowledgeSessionExpired.type) {
      authStateRef.current.sessionExpired = false;
    }
    return action;
  });
});

describe("SessionExpiredRedirect", () => {
  it("redirects to login with the interrupted route when /api/me returns 401", async () => {
    authStateRef.current.sessionExpired = true;

    renderAt("/editor/film?draft=1#scene-2");

    await waitFor(() => {
      expect(readLocation()).toMatchObject({
        pathname: "/login",
        state: {
          from: {
            pathname: "/editor/film",
            search: "?draft=1",
            hash: "#scene-2",
          },
        },
      });
    });
    expect(dispatchMock).toHaveBeenCalledWith(acknowledgeSessionExpired());
  });
});
