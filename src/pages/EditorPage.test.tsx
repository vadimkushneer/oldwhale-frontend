import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { EditorPage } from "./EditorPage";

type AuthState = {
  token: string | null;
  user: { role?: string } | null;
  restoreStatus: "idle" | "restoring" | "ready";
};

const authStateRef = vi.hoisted(() => ({
  current: {
    token: null,
    user: null,
    restoreStatus: "ready",
  } as AuthState,
}));

const dispatchMock = vi.hoisted(() => vi.fn());
const editorScreenMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: { auth: AuthState }) => unknown) =>
    selector({ auth: authStateRef.current }),
}));

vi.mock("../features/auth/authSlice", () => ({
  clearAuth: () => ({ type: "auth/clearAuth" }),
}));

vi.mock("../legacy/routes/Editor", () => ({
  EditorScreen: (props: Record<string, unknown>) => {
    editorScreenMock(props);
    return <div data-testid="editor-screen">EditorScreen</div>;
  },
}));

function LocationProbe() {
  const location = useLocation() as {
    pathname: string;
    search: string;
    state?: unknown;
  };

  return (
    <pre data-testid="location">
      {JSON.stringify({
        pathname: location.pathname,
        search: location.search,
        state: location.state ?? null,
      })}
    </pre>
  );
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:modeName" element={<EditorPage />} />
        <Route path="/login" element={<div data-testid="login-screen">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function readLocation() {
  return JSON.parse(screen.getByTestId("location").textContent || "{}") as {
    pathname: string;
    search: string;
    state?: { from?: { pathname?: string; search?: string } } | null;
  };
}

beforeEach(() => {
  authStateRef.current = {
    token: null,
    user: null,
    restoreStatus: "ready",
  };
  dispatchMock.mockReset();
  editorScreenMock.mockReset();
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("EditorPage", () => {
  it("opens note mode from a pasted route without a stored profile", () => {
    renderAt("/editor/note");

    expect(screen.getByTestId("editor-screen")).toBeInTheDocument();
    expect(readLocation()).toMatchObject({ pathname: "/editor/note", search: "" });
    expect(editorScreenMock.mock.calls.at(-1)?.[0]).toMatchObject({
      isGuest: true,
      profile: { mode: "note" },
      routeMode: "note",
    });
  });

  it("canonicalizes /editor to the stored profile mode", () => {
    authStateRef.current = {
      token: "jwt",
      user: { role: "user" },
      restoreStatus: "ready",
    };
    localStorage.setItem("ow_profile", JSON.stringify({ mode: "play" }));

    renderAt("/editor");

    expect(screen.getByTestId("editor-screen")).toBeInTheDocument();
    expect(readLocation()).toMatchObject({ pathname: "/editor/play", search: "" });
    expect(editorScreenMock.mock.calls.at(-1)?.[0]).toMatchObject({
      profile: { mode: "play" },
      routeMode: "play",
    });
  });

  it("redirects invalid mode params to the canonical editor route", () => {
    authStateRef.current = {
      token: "jwt",
      user: { role: "user" },
      restoreStatus: "ready",
    };
    localStorage.setItem("ow_profile", JSON.stringify({ mode: "media" }));

    renderAt("/editor/unknown?draft=1");

    expect(screen.getByTestId("editor-screen")).toBeInTheDocument();
    expect(readLocation()).toMatchObject({ pathname: "/editor/media", search: "?draft=1" });
  });

  it("preserves the requested mode when redirecting protected routes to login", () => {
    renderAt("/editor/film?draft=1");

    expect(screen.getByTestId("login-screen")).toBeInTheDocument();
    expect(readLocation()).toMatchObject({
      pathname: "/login",
      search: "",
      state: {
        from: {
          pathname: "/editor/film",
          search: "?draft=1",
        },
      },
    });
  });

  it("navigates to the next editor route when the editor requests a mode change", () => {
    authStateRef.current = {
      token: "jwt",
      user: { role: "user" },
      restoreStatus: "ready",
    };

    renderAt("/editor/film");

    const props = editorScreenMock.mock.calls.at(-1)?.[0] as {
      onModeRouteChange?: (mode: string) => void;
    };

    act(() => {
      props.onModeRouteChange?.("short");
    });

    expect(readLocation()).toMatchObject({ pathname: "/editor/short", search: "" });
    expect(editorScreenMock.mock.calls.at(-1)?.[0]).toMatchObject({
      profile: { mode: "short" },
      routeMode: "short",
    });
  });
});
