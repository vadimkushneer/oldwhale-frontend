import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../api/types";
import { apiBaseUrl } from "../../api/env";

const TOKEN_KEY = "ow_token";

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export type RestoreStatus = "idle" | "restoring" | "ready";

export interface AuthState {
  token: string | null;
  user: User | null;
  restoreStatus: RestoreStatus;
  loginLoading: boolean;
  registerLoading: boolean;
  lastError: string | null;
}

function buildInitialAuthState(): AuthState {
  const token = typeof window !== "undefined" ? readStoredToken() : null;
  return {
    token,
    user: null,
    restoreStatus: "idle",
    loginLoading: false,
    registerLoading: false,
    lastError: null,
  };
}

const initialState: AuthState = buildInitialAuthState();

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (!token) return null;
    const base = apiBaseUrl();
    if (!base) return rejectWithValue({ skipClear: true as const, message: "VITE_API_URL is not set" });
    const res = await fetch(`${base}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return rejectWithValue({ unauthorized: true as const });
    if (!res.ok) {
      const body = (await readJsonSafe(res)) as { error?: string } | null;
      return rejectWithValue({
        unauthorized: false as const,
        message:
          body && typeof body === "object" && "error" in body && body.error
            ? body.error
            : res.statusText,
      });
    }
    return (await readJsonSafe(res)) as User;
  },
  {
    condition: (_, { getState }) => Boolean((getState() as { auth: AuthState }).auth.token),
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { login, password }: { login: string; password: string },
    { rejectWithValue },
  ) => {
    const base = apiBaseUrl();
    if (!base) return rejectWithValue("VITE_API_URL is not set");
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; token?: string; user?: User };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    if (!data.token || !data.user) return rejectWithValue("Некорректный ответ сервера");
    return { token: data.token, user: data.user };
  },
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    { login, email, password }: { login: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    const base = apiBaseUrl();
    if (!base) return rejectWithValue("VITE_API_URL is not set");
    const res = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, email, password }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; token?: string; user?: User };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    if (!data.token || !data.user) return rejectWithValue("Некорректный ответ сервера");
    return { token: data.token, user: data.user };
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.lastError = null;
      state.restoreStatus = "ready";
      writeStoredToken(null);
    },
    setAuthFromResponse(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.lastError = null;
      writeStoredToken(action.payload.token);
    },
    clearFormError(state) {
      state.lastError = null;
    },
    /** When there is no token, restore is a no-op — call this once on app boot. */
    markRestoreSkipped(state) {
      state.restoreStatus = "ready";
    },
  },
  extraReducers: (b) => {
    b.addCase(restoreSession.pending, (state) => {
      state.restoreStatus = "restoring";
    })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          if (state.user.disabled) {
            state.token = null;
            state.user = null;
            writeStoredToken(null);
          }
        }
        state.restoreStatus = "ready";
      })
      .addCase(restoreSession.rejected, (state, action) => {
        const p = action.payload as { unauthorized?: boolean; skipClear?: boolean } | undefined;
        if (p && "skipClear" in p && p.skipClear) {
          state.restoreStatus = "ready";
          return;
        }
        if (p && "unauthorized" in p && p.unauthorized) {
          state.token = null;
          state.user = null;
          writeStoredToken(null);
        }
        state.restoreStatus = "ready";
      })
      .addCase(loginThunk.pending, (state) => {
        state.loginLoading = true;
        state.lastError = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        writeStoredToken(action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loginLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка входа");
      })
      .addCase(registerThunk.pending, (state) => {
        state.registerLoading = true;
        state.lastError = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        writeStoredToken(action.payload.token);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.registerLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка регистрации");
      });
  },
});

export const { clearAuth, setAuthFromResponse, clearFormError, markRestoreSkipped } = authSlice.actions;
