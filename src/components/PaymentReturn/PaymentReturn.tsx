import { Link } from "react-router-dom";
import { PAYMENT_LOGIN_REDIRECT_STATE, usePaymentReturn } from "./usePaymentReturn";
import "./PaymentReturn.scss";

export function PaymentReturn() {
  const vm = usePaymentReturn();

  return (
    <div className="payret">
      <div className="payret__card">
        <div className={`payret__badge payret__badge--${vm.phase}`} aria-hidden>
          {vm.phase === "paid" ? "✓" : vm.phase === "failed" ? "✕" : "…"}
        </div>

        <div className="payret__title">{vm.title}</div>
        <div className="payret__message">{vm.message}</div>

        {vm.phase === "paid" && vm.creditsText ? (
          <div className="payret__amount">
            <span className="payret__amount-label">ЗАЧИСЛЕНО</span>
            <span className="payret__amount-value">+{vm.creditsText}</span>
          </div>
        ) : null}

        {vm.balanceText ? (
          <div className="payret__balance">
            <span className="payret__balance-label">БАЛАНС</span>
            <span className="payret__balance-value">{vm.balanceText}</span>
          </div>
        ) : null}

        {vm.errorMessage ? (
          <div className="payret__error" role="alert">
            {vm.errorMessage}
          </div>
        ) : null}

        <div className="payret__actions">
          {vm.canRetry ? (
            <button
              type="button"
              className="payret__button payret__button--ghost"
              onClick={vm.onRetry}
              disabled={vm.busy}
            >
              {vm.busy ? "ПРОВЕРКА…" : "ПРОВЕРИТЬ СНОВА"}
            </button>
          ) : null}

          {vm.phase === "unauthorized" ? (
            <Link
              className="payret__button payret__button--primary"
              to="/login"
              state={PAYMENT_LOGIN_REDIRECT_STATE}
            >
              ВОЙТИ
            </Link>
          ) : (
            <Link className="payret__button payret__button--primary" to="/profile">
              В ПРОФИЛЬ
            </Link>
          )}

          <Link className="payret__button payret__button--ghost" to="/editor">
            РЕДАКТОР
          </Link>
        </div>
      </div>
    </div>
  );
}
