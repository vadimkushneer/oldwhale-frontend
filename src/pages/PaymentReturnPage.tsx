import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { syncPaymentThunk } from "../features/payments/paymentsThunks";
import { formatCredits } from "../features/credits/credits";
import { useAppDispatch, useAppSelector } from "../hooks";
import "./PaymentReturnPage.scss";

type ReturnPhase = "redirect-login" | "syncing" | "paid" | "pending" | "failed" | "error";

export function PaymentReturnPage() {
  const { paymentId = "" } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const [phase, setPhase] = useState<ReturnPhase>("syncing");
  const [error, setError] = useState<string | null>(null);
  const [creditsGranted, setCreditsGranted] = useState<number | null>(null);

  const gatewayOrderId = searchParams.get("orderId");

  const runSync = useCallback(async () => {
    if (!paymentId) {
      setPhase("error");
      setError("Некорректная ссылка возврата");
      return;
    }
    setPhase("syncing");
    setError(null);
    try {
      const result = await dispatch(syncPaymentThunk({ paymentId })).unwrap();
      setCreditsGranted(result.payment.credits);
      if (result.payment.credited || result.payment.status === "paid") {
        setPhase("paid");
      } else if (result.payment.status === "failed" || result.payment.status === "canceled") {
        setPhase("failed");
      } else {
        setPhase("pending");
      }
    } catch (e: unknown) {
      setPhase("error");
      setError(typeof e === "string" ? e : "Не удалось проверить статус платежа");
    }
  }, [dispatch, paymentId]);

  useEffect(() => {
    if (!token) return;
    void runSync();
  }, [token, runSync]);

  const balanceText = useMemo(() => formatCredits(user?.credits ?? 0), [user?.credits]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: { pathname: `/payment/return/${paymentId}` } }} />;
  }

  return (
    <div className="payment-return ow-app-scrollbar">
      <div className="payment-return__inner">
        <h1 className="payment-return__title">ОПЛАТА</h1>

        {phase === "syncing" ? (
          <p className="payment-return__message">ПРОВЕРКА СТАТУСА ПЛАТЕЖА…</p>
        ) : null}

        {phase === "paid" ? (
          <div className="payment-return__card payment-return__card--success">
            <p className="payment-return__headline">ПЛАТЁЖ УСПЕШЕН</p>
            {creditsGranted != null ? (
              <p className="payment-return__detail">Зачислено: {formatCredits(creditsGranted)}</p>
            ) : null}
            <p className="payment-return__detail">Текущий баланс: {balanceText}</p>
          </div>
        ) : null}

        {phase === "pending" ? (
          <div className="payment-return__card">
            <p className="payment-return__headline">ОЖИДАНИЕ ПОДТВЕРЖДЕНИЯ</p>
            <p className="payment-return__detail">
              Платёж ещё обрабатывается. Если вы уже оплатили, подождите немного и обновите статус.
            </p>
            {gatewayOrderId ? (
              <p className="payment-return__meta">Заказ: {gatewayOrderId}</p>
            ) : null}
            <button type="button" className="payment-return__button" onClick={() => void runSync()}>
              ОБНОВИТЬ СТАТУС
            </button>
          </div>
        ) : null}

        {phase === "failed" ? (
          <div className="payment-return__card payment-return__card--failed">
            <p className="payment-return__headline">ПЛАТЁЖ НЕ ВЫПОЛНЕН</p>
            <p className="payment-return__detail">Оплата отменена или отклонена. Средства не списаны.</p>
          </div>
        ) : null}

        {phase === "error" ? (
          <div className="payment-return__card payment-return__card--failed">
            <p className="payment-return__headline">ОШИБКА</p>
            <p className="payment-return__detail">{error ?? "Неизвестная ошибка"}</p>
            <button type="button" className="payment-return__button" onClick={() => void runSync()}>
              ПОВТОРИТЬ
            </button>
          </div>
        ) : null}

        <nav className="payment-return__nav">
          <Link className="payment-return__link" to="/profile">
            ПРОФИЛЬ
          </Link>
          <Link className="payment-return__link payment-return__link--accent" to="/editor">
            РЕДАКТОР →
          </Link>
        </nav>
      </div>
    </div>
  );
}
