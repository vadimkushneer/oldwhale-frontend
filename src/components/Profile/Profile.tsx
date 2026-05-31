import { Link, Navigate } from "react-router-dom";
import { PROFILE_LOGIN_REDIRECT_STATE, useProfile } from "./useProfile";
import "./Profile.scss";

export function Profile() {
  const vm = useProfile();

  if (vm.phase === "redirect-login") {
    return <Navigate to="/login" replace state={PROFILE_LOGIN_REDIRECT_STATE} />;
  }

  if (vm.phase === "session-restore") {
    return (
      <div className="profile profile--blocking">
        <div className="profile__blocking-title">ВОССТАНОВЛЕНИЕ СЕССИИ…</div>
      </div>
    );
  }

  return (
    <div className="profile ow-app-scrollbar">
      <div className="profile__inner">
        {!vm.online ? (
          <div className="profile__offline-banner">
            НЕТ ПОДКЛЮЧЕНИЯ — ДАННЫЕ МОГУТ БЫТЬ УСТАРЕВШИМИ
          </div>
        ) : null}

        <div className="profile__toolbar">
          <div className="profile__title">ПРОФИЛЬ</div>
          <nav className="profile__nav">
            {vm.isAdmin ? (
              <Link className="profile__nav-link profile__nav-link--muted" to="/admin">
                АДМИН →
              </Link>
            ) : null}
            <Link className="profile__nav-link profile__nav-link--accent" to="/editor">
              РЕДАКТОР →
            </Link>
          </nav>
        </div>

        {vm.phase === "unavailable" ? (
          <div className="profile__card profile__card--message">
            <div className="profile__message-title">НЕ УДАЛОСЬ ЗАГРУЗИТЬ ПРОФИЛЬ</div>
            <div className="profile__message-text">
              Сессия активна, но данные учётной записи недоступны. Проверьте подключение и обновите.
            </div>
            <button
              type="button"
              className="profile__button profile__button--primary"
              onClick={vm.onRefresh}
              disabled={vm.refreshing || !vm.online}
            >
              {vm.refreshing ? "ОБНОВЛЕНИЕ…" : "ОБНОВИТЬ"}
            </button>
          </div>
        ) : (
          <div className="profile__card">
            <header className="profile__identity">
              <div className="profile__avatar" aria-hidden>
                {vm.monogram}
              </div>
              <div className="profile__identity-text">
                <div className="profile__name">{vm.displayName}</div>
                <div className="profile__role">{vm.roleLabel}</div>
              </div>
            </header>

            <section className="profile__balance" aria-label="Баланс кредитов">
              <div className="profile__balance-head">
                <span className="profile__balance-label">КРЕДИТЫ · KRILL</span>
                <span className="profile__balance-value">{vm.creditsText}</span>
              </div>
              <div className="profile__topup">
                <span className="profile__topup-label">ПОПОЛНИТЬ</span>
                <div className="profile__topup-options">
                  {vm.topUpPresets.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="profile__button profile__button--primary profile__topup-button"
                      onClick={() => vm.onTopUp(amount)}
                      disabled={vm.topUpBusy || !vm.online}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
              </div>
              {vm.topUpError ? (
                <div className="profile__topup-error" role="alert">
                  {vm.topUpError}
                </div>
              ) : null}
            </section>

            <dl className="profile__fields">
              {vm.fields.map((field) => (
                <div className="profile__field" key={field.key}>
                  <dt className="profile__field-label">{field.label}</dt>
                  <dd
                    className={
                      field.tone === "muted"
                        ? "profile__field-value profile__field-value--muted"
                        : "profile__field-value"
                    }
                  >
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="profile__actions">
              <button
                type="button"
                className="profile__button profile__button--ghost"
                onClick={vm.onRefresh}
                disabled={vm.refreshing || !vm.online}
              >
                {vm.refreshing ? "ОБНОВЛЕНИЕ…" : "ОБНОВИТЬ"}
              </button>
              <button
                type="button"
                className="profile__button profile__button--danger"
                onClick={vm.onLogout}
              >
                ВЫЙТИ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
