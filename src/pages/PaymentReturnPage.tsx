import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { PaymentOrder, PaymentOrderStatus } from "../api/types";
import { apiRequestBase } from "../api/env";
import { restoreSession } from "../features/auth/authSlice";
import { formatCredits } from "../features/credits/credits";
import { useAppDispatch, useAppSelector } from "../hooks";
import "../components/Profile/Profile.scss";

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function statusText(status: PaymentOrderStatus | "unknown"): { title: string; body: string } {
  if (status === "paid") {
    return {
      title: "ОПЛАТА ПОДТВЕРЖДЕНА",
      body: "Баланс Krill обновлён. Можно вернуться в профиль или продолжить работу в редакторе.",
    };
  }
  if (status === "failed" || status === "refunded") {
    return {
      title: "ОПЛАТА НЕ ЗАВЕРШЕНА",
      body: "Платёж не был подтверждён банком. Кредиты не начислены.",
    };
  }
  return {
    title: "ПРОВЕРЯЕМ ОПЛАТУ",
    body: "Если платёж уже прошёл, баланс обновится после подтверждения банка.",
  };
}

export function PaymentReturnPage() {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const orderUid = params.get("order_uid") ?? "";
  const initialStatus = (params.get("status") as PaymentOrderStatus | null) ?? "unknown";
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [status, setStatus] = useState<PaymentOrderStatus | "unknown">(initialStatus);
  const [loading, setLoading] = useState(Boolean(orderUid && token));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderUid || !token) return;
    const base = apiRequestBase();
    if (!base) {
      setError("API base URL unavailable");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function refreshPayment() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${base}/api/payments/orders/${encodeURIComponent(orderUid)}/refresh`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await readJsonSafe(res)) as PaymentOrder | { error?: string } | null;
        if (!res.ok) {
          const message = data && typeof data === "object" && "error" in data && data.error ? data.error : res.statusText;
          throw new Error(message);
        }
        if (!cancelled && data) {
          const payment = data as PaymentOrder;
          setOrder(payment);
          setStatus(payment.status);
          if (payment.status === "paid") void dispatch(restoreSession());
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось проверить оплату");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void refreshPayment();
    return () => {
      cancelled = true;
    };
  }, [dispatch, orderUid, token]);

  const copy = useMemo(() => statusText(status), [status]);

  return (
    <div className="profile profile--blocking">
      <div className="profile__inner">
        <div className="profile__card profile__card--message">
          <div className="profile__message-title">{loading ? "ПРОВЕРКА ПЛАТЕЖА…" : copy.title}</div>
          <div className="profile__message-text">
            {copy.body}
            {order ? ` Заказ: ${formatCredits(order.credits)}.` : null}
          </div>
          {error ? (
            <div className="profile__topup-error" role="alert">
              {error}
            </div>
          ) : null}
          {!token ? (
            <div className="profile__topup-error" role="alert">
              Войдите в аккаунт, чтобы обновить баланс после оплаты.
            </div>
          ) : null}
          <div className="profile__actions">
            <Link className="profile__button profile__button--primary profile__nav-link" to="/profile">
              ПРОФИЛЬ
            </Link>
            <Link className="profile__button profile__button--ghost profile__nav-link" to="/editor">
              РЕДАКТОР
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
