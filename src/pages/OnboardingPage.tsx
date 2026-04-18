import { useNavigate } from "react-router-dom";
import { Onboarding } from "../legacy/routes/Onboarding";
import { useAppSelector } from "../hooks";

export function OnboardingPage() {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);

  return (
    <Onboarding
      onSelect={(p: { mode?: string }) => {
        try {
          localStorage.setItem("ow_profile", JSON.stringify(p));
        } catch {
          /* ignore */
        }
        if (p.mode === "note") {
          navigate("/editor", { replace: false });
          return;
        }
        /**
         * If a JWT is already persisted (even while `/api/me` is still in
         * flight), skip the login form — the user is logged in, so picking a
         * mode must not re-demand credentials. `EditorPage` handles the
         * "restoring session" UI while the token is revalidated.
         */
        if (token) {
          navigate("/editor", { replace: false });
          return;
        }
        navigate("/login", { replace: false, state: { from: { pathname: "/editor", search: "" } } });
      }}
    />
  );
}
