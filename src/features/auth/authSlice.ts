import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../api/types";
import { apiRequestBase } from "../../api/env";

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
  passwordResetLoading: boolean;
  lastError: string | null;
  sessionExpired: boolean;
}

function buildInitialAuthState(): AuthState {
  const token = typeof window !== "undefined" ? readStoredToken() : null;
  return {
    token,
    user: null,
    restoreStatus: "idle",
    loginLoading: false,
    registerLoading: false,
    passwordResetLoading: false,
    lastError: null,
    sessionExpired: false,
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
    const base = apiRequestBase();
    if (!base) return rejectWithValue({ skipClear: true as const, message: "API base URL unavailable" });
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
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: login, password }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; token?: string; user?: User };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    if (!data.token || !data.user) return rejectWithValue("Некорректный ответ сервера");
    return { token: data.token, user: data.user };
  },
);

export const requestRegistrationOtpThunk = createAsyncThunk(
  "auth/register/requestOtp",
  async (
    { email }: { email: string },
    { rejectWithValue },
  ) => {
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/auth/register/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; expiresInSeconds?: number };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    return { expiresInSeconds: data?.expiresInSeconds ?? 600 };
  },
);

export const verifyRegistrationOtpThunk = createAsyncThunk(
  "auth/register/verifyOtp",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue },
  ) => {
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/auth/register/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; setupToken?: string; expiresInSeconds?: number };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    if (!data.setupToken) return rejectWithValue("Некорректный ответ сервера");
    return { setupToken: data.setupToken, expiresInSeconds: data.expiresInSeconds ?? 900 };
  },
);

export const completeRegistrationThunk = createAsyncThunk(
  "auth/register/complete",
  async (
    { email, setupToken, password }: { email: string; setupToken: string; password: string },
    { rejectWithValue },
  ) => {
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/auth/register/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, setupToken, password }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; token?: string; user?: User };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    if (!data.token || !data.user) return rejectWithValue("Некорректный ответ сервера");
    return { token: data.token, user: data.user };
  },
);

export const requestPasswordResetThunk = createAsyncThunk(
  "auth/passwordReset/request",
  async (
    { login }: { login: string },
    { rejectWithValue },
  ) => {
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/auth/password-reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    });
    const data = (await readJsonSafe(res)) as { error?: string; expiresInSeconds?: number };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    return { expiresInSeconds: data?.expiresInSeconds ?? 3600 };
  },
);

export const completePasswordResetThunk = createAsyncThunk(
  "auth/passwordReset/complete",
  async (
    { email, token, password }: { email: string; token: string; password: string },
    { rejectWithValue },
  ) => {
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/auth/password-reset/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const data = (await readJsonSafe(res)) as { error?: string };
    if (!res.ok) {
      return rejectWithValue(data?.error || res.statusText);
    }
    return { ok: true };
  },
);

export const topUpCreditsThunk = createAsyncThunk(
  "auth/credits/topup",
  async ({ amount }: { amount: number }, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (!token) return rejectWithValue("Не авторизован");
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");
    const res = await fetch(`${base}/api/me/credits/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    });
    const data = (await readJsonSafe(res)) as User | { error?: string } | null;
    if (!res.ok) {
      const message = data && typeof data === "object" && "error" in data && data.error ? data.error : res.statusText;
      return rejectWithValue(message);
    }
    return data as User;
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Replaces just the credit balance (e.g. after a paid AI request debits it). */
    setUserCredits(state, action: PayloadAction<number>) {
      if (state.user) state.user.credits = Math.max(0, Math.trunc(action.payload));
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.lastError = null;
      state.restoreStatus = "ready";
      state.sessionExpired = false;
      writeStoredToken(null);
    },
    setAuthFromResponse(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.lastError = null;
      state.sessionExpired = false;
      writeStoredToken(action.payload.token);
    },
    clearFormError(state) {
      state.lastError = null;
    },
    /** When there is no token, restore is a no-op — call this once on app boot. */
    markRestoreSkipped(state) {
      state.restoreStatus = "ready";
    },
    acknowledgeSessionExpired(state) {
      state.sessionExpired = false;
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
            state.sessionExpired = false;
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
          state.sessionExpired = true;
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
        state.sessionExpired = false;
        writeStoredToken(action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loginLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка входа");
      })
      .addCase(requestRegistrationOtpThunk.pending, (state) => {
        state.registerLoading = true;
        state.lastError = null;
      })
      .addCase(requestRegistrationOtpThunk.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(requestRegistrationOtpThunk.rejected, (state, action) => {
        state.registerLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка регистрации");
      })
      .addCase(verifyRegistrationOtpThunk.pending, (state) => {
        state.registerLoading = true;
        state.lastError = null;
      })
      .addCase(verifyRegistrationOtpThunk.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(verifyRegistrationOtpThunk.rejected, (state, action) => {
        state.registerLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка подтверждения кода");
      })
      .addCase(completeRegistrationThunk.pending, (state) => {
        state.registerLoading = true;
        state.lastError = null;
      })
      .addCase(completeRegistrationThunk.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.sessionExpired = false;
        writeStoredToken(action.payload.token);
      })
      .addCase(completeRegistrationThunk.rejected, (state, action) => {
        state.registerLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка регистрации");
      })
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.passwordResetLoading = true;
        state.lastError = null;
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state) => {
        state.passwordResetLoading = false;
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка восстановления пароля");
      })
      .addCase(completePasswordResetThunk.pending, (state) => {
        state.passwordResetLoading = true;
        state.lastError = null;
      })
      .addCase(completePasswordResetThunk.fulfilled, (state) => {
        state.passwordResetLoading = false;
      })
      .addCase(completePasswordResetThunk.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.lastError = String(action.payload || action.error.message || "Ошибка восстановления пароля");
      })
      .addCase(topUpCreditsThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const {
  clearAuth,
  setAuthFromResponse,
  clearFormError,
  markRestoreSkipped,
  acknowledgeSessionExpired,
  setUserCredits,
} = authSlice.actions;
