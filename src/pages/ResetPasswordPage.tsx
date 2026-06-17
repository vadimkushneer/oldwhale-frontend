import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearFormError, completePasswordResetThunk } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { ACCENT, BG, SH_IN, SH_OUT, SH_SM, SURF, T1, T3 } from "../legacy/ui/tokens";
import { Whale } from "../legacy/ui/Whale";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.auth.passwordResetLoading);
  const lastError = useAppSelector((s) => s.auth.lastError);
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    dispatch(clearFormError());
  }, [dispatch]);

  const submit = async () => {
    setLocalError("");
    if (!email || !token) {
      setLocalError(t("admin.resetPassword.invalidLink"));
      return;
    }
    if (password.length < 4) {
      setLocalError(t("admin.resetPassword.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setLocalError(t("admin.resetPassword.passwordMismatch"));
      return;
    }

    try {
      await dispatch(completePasswordResetThunk({ email, token, password })).unwrap();
      dispatch(clearFormError());
      setPassword("");
      setConfirmPassword("");
      setDone(true);
    } catch {
      /* Redux error is rendered below. */
    }
  };

  const nmInput = {
    width: "100%",
    padding: "13px 16px 13px 52px",
    background: BG,
    boxShadow: SH_IN,
    border: "none",
    borderRadius: "12px",
    color: T1,
    fontSize: "16px",
    fontFamily: "'Courier New',monospace",
    outline: "none",
    boxSizing: "border-box" as const,
    letterSpacing: "0.5px",
  };

  const feedback = localError || lastError;

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New',monospace",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: SURF,
              boxShadow: SH_OUT,
              marginBottom: "24px",
            }}
          >
            <Whale size={52} />
          </div>
          <div style={{ color: T1, fontSize: "20px", letterSpacing: "7px", marginBottom: "6px" }}>OLD WHALE</div>
          <div style={{ color: T3, fontSize: "10px", letterSpacing: "4px" }}>{t("admin.resetPassword.subtitle")}</div>
        </div>

        <div
          style={{
            background: SURF,
            boxShadow: "10px 10px 28px rgba(0,0,0,0.65), -5px -5px 14px rgba(255,255,255,0.032)",
            borderRadius: "24px",
            padding: "40px 36px",
          }}
        >
          {done ? (
            <>
              <div style={{ color: T3, fontSize: "12px", lineHeight: 1.6, letterSpacing: "1px", textAlign: "center" }}>
                {t("admin.resetPassword.success")}
              </div>
              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                style={{
                  width: "100%",
                  marginTop: "24px",
                  padding: "14px",
                  background: ACCENT,
                  boxShadow: `0 4px 20px ${ACCENT}55, ${SH_SM}`,
                  color: "#fff",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "'Courier New',monospace",
                  letterSpacing: "3px",
                }}
              >
                {t("admin.resetPassword.login")}
              </button>
            </>
          ) : (
            <>
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", width: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: T3, fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>◈</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  style={nmInput}
                  placeholder={t("admin.resetPassword.newPasswordPlaceholder")}
                  type="password"
                />
              </div>
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", width: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: T3, fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>◈</span>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  style={nmInput}
                  placeholder={t("admin.resetPassword.confirmPasswordPlaceholder")}
                  type="password"
                />
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: "24px",
                  padding: "14px",
                  background: loading ? BG : ACCENT,
                  boxShadow: loading ? SH_IN : `0 4px 20px ${ACCENT}55, ${SH_SM}`,
                  color: loading ? T3 : "#fff",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "12px",
                  cursor: loading ? "default" : "pointer",
                  fontFamily: "'Courier New',monospace",
                  letterSpacing: "3px",
                }}
              >
                {loading ? t("admin.resetPassword.saving") : t("admin.resetPassword.submit")}
              </button>
              {feedback ? (
                <div style={{ textAlign: "center", marginTop: "14px", color: "#f472b6", fontSize: "11px", letterSpacing: "1px", lineHeight: 1.4 }}>
                  {feedback}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
