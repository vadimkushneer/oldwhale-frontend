import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { syncPaymentThunk } from "../../features/auth/authSlice";
import { CREDITS_UNIT_SHORT, formatCredits } from "../../features/credits/credits";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Payment } from "../../api/types";

/** Sends the user back to `/profile` after re-authenticating, if needed. */
export const PAYMENT_LOGIN_REDIRECT_STATE = { from: { pathname: "/profile", search: "" } };

export type PaymentReturnPhase =
  | "no-id"
  | "unauthorized"
  | "checking"
  | "paid"
  | "pending"
  | "failed"
  | "error";

/** How many times to silently re-check while the gateway is still settling. */
const MAX_AUTO_RETRIES = 4;
const RETRY_DELAY_MS = 2500;

export interface UsePaymentReturnResult {
  phase: PaymentReturnPhase;
  busy: boolean;
  title: string;
  message: string;
  creditsText: string | null;
  balanceText: string | null;
  errorMessage: string | null;
  canRetry: boolean;
  onRetry: () => void;
}

/**
 * Drives the post-payment landing page. The gateway redirect is only a hint, so
 * this always asks the backend to verify the order against the gateway
 * (`getOrderStatusExtended`) and grant credits idempotently. While the order is
 * still settling it silently re-checks a few times before offering a manual retry.
 */
export function usePaymentReturn(): UsePaymentReturnResult {
  const { paymentId } = useParams<{ paymentId: string }>();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const [phase, setPhase] = useState<PaymentReturnPhase>("checking");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const check = useCallback(async () => {
    if (!paymentId) {
      setPhase("no-id");
      return;
    }
    if (!token) {
      setPhase("unauthorized");
      return;
    }
    setBusy(true);
    try {
      const resp = await dispatch(syncPaymentThunk({ uid: paymentId })).unwrap();
      setPayment(resp.payment);
      const status = resp.payment.status;
      if (status === "paid") setPhase("paid");
      else if (status === "failed" || status === "canceled" || status === "refunded") setPhase("failed");
      else setPhase("pending");
    } catch (e: unknown) {
      setErrorMessage(typeof e === "string" ? e : "Не удалось проверить статус платежа");
      setPhase("error");
    } finally {
      setBusy(false);
    }
  }, [dispatch, paymentId, token]);

  useEffect(() => {
    void check();
  }, [check]);

  useEffect(() => {
    if (phase !== "pending" || attempts >= MAX_AUTO_RETRIES) return;
    const timer = setTimeout(() => {
      setAttempts((n) => n + 1);
      void check();
    }, RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, attempts, check]);

  const onRetry = useCallback(() => {
    setErrorMessage(null);
    void check();
  }, [check]);

  const creditsText = payment ? `${payment.credits} ${CREDITS_UNIT_SHORT}` : null;
  const balanceText = user ? formatCredits(user.credits) : null;

  return {
    phase,
    busy,
    title: titleFor(phase),
    message: messageFor(phase, payment),
    creditsText,
    balanceText,
    errorMessage,
    canRetry: phase === "pending" || phase === "error",
    onRetry,
  };
}

function titleFor(phase: PaymentReturnPhase): string {
  switch (phase) {
    case "paid":
      return "ОПЛАТА ПРОШЛА";
    case "pending":
      return "ОБРАБОТКА ПЛАТЕЖА…";
    case "failed":
      return "ПЛАТЁЖ НЕ ВЫПОЛНЕН";
    case "unauthorized":
      return "ВОЙДИТЕ В АККАУНТ";
    case "no-id":
      return "ПЛАТЁЖ НЕ НАЙДЕН";
    case "error":
      return "НЕ УДАЛОСЬ ПРОВЕРИТЬ";
    case "checking":
    default:
      return "ПРОВЕРКА ПЛАТЕЖА…";
  }
}

function messageFor(phase: PaymentReturnPhase, payment: Payment | null): string {
  switch (phase) {
    case "paid":
      return "Баланс пополнен. Криль зачислен на ваш счёт.";
    case "pending":
      return "Платёж ещё обрабатывается банком. Это может занять несколько секунд.";
    case "failed":
      return payment?.errorMessage
        ? `Платёж отклонён: ${payment.errorMessage}`
        : "Платёж отклонён или отменён. Средства не списаны.";
    case "unauthorized":
      return "Сессия не найдена. Войдите в аккаунт, чтобы проверить статус платежа.";
    case "no-id":
      return "Не указан идентификатор платежа.";
    case "error":
      return "Не удалось связаться с сервером. Попробуйте проверить статус ещё раз.";
    case "checking":
    default:
      return "Подтверждаем статус платежа в банке…";
  }
}
