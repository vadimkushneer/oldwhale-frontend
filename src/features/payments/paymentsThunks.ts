import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequestBase } from "../../api/env";
import type { PaymentCreateResponse, PaymentSyncResponse } from "../../api/types";
import type { AuthState } from "../auth/authSlice";
import i18n from "../../i18n";

async function readJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export type CreatePaymentRejected = { message: string; status: number };

/** Registers a VTB redirect payment and returns the hosted payment page URL. */
export const createPaymentThunk = createAsyncThunk(
  "payments/create",
  async ({ credits }: { credits: number }, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (!token) return rejectWithValue(i18n.t("auth.notAuthorized"));
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");

    const res = await fetch(`${base}/api/me/payments`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ credits }),
    });
    const data = (await readJsonSafe(res)) as PaymentCreateResponse | { error?: string } | null;
    if (!res.ok) {
      const message =
        data && typeof data === "object" && "error" in data && data.error ? data.error : res.statusText;
      return rejectWithValue({ message, status: res.status } satisfies CreatePaymentRejected);
    }
    return data as PaymentCreateResponse;
  },
);

/** Confirms payment status with VTB after the payer returns from the hosted page. */
export const syncPaymentThunk = createAsyncThunk(
  "payments/sync",
  async ({ paymentId }: { paymentId: string }, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (!token) return rejectWithValue(i18n.t("auth.notAuthorized"));
    const base = apiRequestBase();
    if (!base) return rejectWithValue("API base URL unavailable");

    const res = await fetch(`${base}/api/me/payments/${encodeURIComponent(paymentId)}/sync`, {
      method: "POST",
      headers: authHeaders(token),
    });
    const data = (await readJsonSafe(res)) as PaymentSyncResponse | { error?: string } | null;
    if (!res.ok) {
      const message =
        data && typeof data === "object" && "error" in data && data.error ? data.error : res.statusText;
      return rejectWithValue(message);
    }
    return data as PaymentSyncResponse;
  },
);
