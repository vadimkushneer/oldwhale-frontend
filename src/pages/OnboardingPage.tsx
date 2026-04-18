import { useNavigate } from "react-router-dom";
import { Onboarding } from "../legacy/routes/Onboarding";

export function OnboardingPage() {
  const navigate = useNavigate();
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
        navigate("/login", { replace: false, state: { from: { pathname: "/editor", search: "" } } });
      }}
    />
  );
}
