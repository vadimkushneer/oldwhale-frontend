// @ts-nocheck
/**
 * Login / register screen. Extracted from legacyUiBundle.tsx:375-557.
 *
 * In the generated bundle this component was further patched by the
 * generator to wire up the `submitLogin / submitRegister / authError` props
 * (see the `Wire login/register to app-level async handlers` block that
 * used to live in scripts/prepare-legacy.mjs). Now that Login is split out
 * those props ship as part of this hand-written module and the generator
 * no longer touches it.
 *
 * Colors / shadows / text tokens come from src/legacy/ui/tokens, the whale
 * logo from src/legacy/ui/Whale. `@ts-nocheck` mirrors the rest of the
 * legacy UI until the whole folder is typed.
 */
import { useState } from "react";
import {
  BG,
  SURF,
  SH_OUT,
  SH_IN,
  SH_SM,
  ACCENT,
  T1,
  T3,
} from "../../ui/tokens";
import { Whale } from "../../ui/Whale";

export function Login({
  onLogin,
  submitLogin,
  submitRegisterEmail,
  submitVerifyRegistrationOtp,
  submitCompleteRegistration,
  authError,
}: {
  onLogin: () => void;
  submitLogin?: (login: string, password: string) => Promise<void>;
  submitRegisterEmail?: (email: string) => Promise<void>;
  submitVerifyRegistrationOtp?: (email: string, otp: string) => Promise<{ setupToken: string }>;
  submitCompleteRegistration?: (email: string, setupToken: string, password: string) => Promise<void>;
  authError?: string | null;
}) {
  const [tab, setTab] = useState("in");
  const [registerStep, setRegisterStep] = useState("email");
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (tab === "in" && (!login || !pass)) return;
    if (tab === "reg" && registerStep === "email" && !email) return;
    if (tab === "reg" && registerStep === "otp" && !otp) return;
    if (tab === "reg" && registerStep === "password" && (!pass || !setupToken)) return;
    setLoading(true);
    try {
      if (submitLogin && submitRegisterEmail && submitVerifyRegistrationOtp && submitCompleteRegistration) {
        if (tab === "in") {
          await submitLogin(login, pass);
          onLogin();
        } else if (registerStep === "email") {
          await submitRegisterEmail(email);
          setRegisterStep("otp");
          setOtp("");
          setPass("");
        } else if (registerStep === "otp") {
          const result = await submitVerifyRegistrationOtp(email, otp);
          setSetupToken(result.setupToken);
          setRegisterStep("password");
          setPass("");
        } else {
          await submitCompleteRegistration(email, setupToken, pass);
          onLogin();
        }
      } else {
        await new Promise((r) => setTimeout(r, 1600));
        onLogin();
      }
    } catch {
      /* parent surfaces authError */
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setPass("");
    if (nextTab === "reg") {
      setRegisterStep("email");
      setOtp("");
      setSetupToken("");
    }
  };

  const submitLabel =
    tab === "in"
      ? "ВОЙТИ"
      : registerStep === "email"
        ? "ПОЛУЧИТЬ КОД"
        : registerStep === "otp"
          ? "ПОДТВЕРДИТЬ EMAIL"
          : "СОЗДАТЬ АККАУНТ";

  const loadingLabel =
    tab === "in"
      ? "ВХОДИМ..."
      : registerStep === "email"
        ? "ОТПРАВЛЯЕМ..."
        : registerStep === "otp"
          ? "ПРОВЕРЯЕМ..."
          : "СОЗДАЕМ...";

  const nmCard = {
    background: SURF,
    boxShadow: "10px 10px 28px rgba(0,0,0,0.65), -5px -5px 14px rgba(255,255,255,0.032)",
    borderRadius: "24px",
    padding: "40px 36px",
  };

  const nmInput = {
    width:"100%", padding:"13px 16px 13px 52px",
    background: BG,
    boxShadow: SH_IN,
    border:"none", borderRadius:"12px",
    color: T1, fontSize:"16px",
    fontFamily:"'Courier New',monospace",
    outline:"none", boxSizing:"border-box",
    letterSpacing:"0.5px",
  };

  const nmBtn = (active) => ({
    flex:1, padding:"10px 8px", border:"none",
    background: "transparent",
    boxShadow: active ? SH_IN : "none",
    borderRadius:"10px",
    color: active ? T1 : T3,
    fontSize:"11px", cursor:"pointer",
    fontFamily:"'Courier New',monospace",
    letterSpacing:"2px", transition:"all .2s",
  });

  return (
    <div style={{
      background: BG, minHeight:"100vh",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Courier New',monospace", padding:"24px", boxSizing:"border-box",
    }}>
      <div style={{width:"100%", maxWidth:"360px"}}>

        {/* Header */}
        <div style={{textAlign:"center", marginBottom:"40px"}}>
          <div style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:"88px", height:"88px", borderRadius:"50%",
            background: SURF, boxShadow: SH_OUT,
            marginBottom:"24px",
          }}>
            <Whale size={52}/>
          </div>
          <div style={{color:T1, fontSize:"20px", letterSpacing:"7px", marginBottom:"6px"}}>OLD WHALE</div>
          <div style={{color:T3, fontSize:"10px", letterSpacing:"4px"}}>РЕДАКТОР ИСТОРИЙ</div>
        </div>

        {/* Card */}
        <div style={nmCard}>

          {/* Tabs */}
          <div style={{
            display:"flex", marginBottom:"28px",
            background: BG, borderRadius:"12px", padding:"4px",
            boxShadow: SH_IN,
          }}>
            {[["in","ВОЙТИ"],["reg","РЕГИСТРАЦИЯ"]].map(([id,l])=>(
              <button key={id} onClick={()=>switchTab(id)} style={nmBtn(tab===id)}>{l}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{display:"flex", flexDirection:"column"}}>
            {tab==="in" && (
              <div style={{position:"relative", marginBottom:"8px"}}>
                <span style={{position:"absolute",left:"18px",top:"50%",transform:"translateY(-50%)",width:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:T3,fontSize:"13px",lineHeight:1,pointerEvents:"none"}}>◉</span>
                <input value={login} onChange={e=>setLogin(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={nmInput} placeholder="логин или email"/>
              </div>
            )}

            {tab==="reg" && (
              <>
                <div style={{position:"relative", marginBottom:"8px"}}>
                  <span style={{position:"absolute",left:"18px",top:"50%",transform:"translateY(-50%)",width:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:T3,fontSize:"13px",lineHeight:1,pointerEvents:"none"}}>✉</span>
                  <input value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&submit()}
                    style={{...nmInput, opacity: registerStep === "email" ? 1 : 0.72}}
                    placeholder="email" type="email" disabled={registerStep !== "email"}/>
                </div>

                {registerStep==="otp" && (
                  <div style={{position:"relative", marginBottom:"8px"}}>
                    <span style={{position:"absolute",left:"18px",top:"50%",transform:"translateY(-50%)",width:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:T3,fontSize:"13px",lineHeight:1,pointerEvents:"none"}}>✦</span>
                    <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onKeyDown={e=>e.key==="Enter"&&submit()}
                      style={nmInput} placeholder="код из email" inputMode="numeric"/>
                  </div>
                )}
              </>
            )}

            {(tab==="in" || registerStep==="password") && (
              <div style={{position:"relative", marginBottom:"8px"}}>
                <span style={{position:"absolute",left:"18px",top:"50%",transform:"translateY(-50%)",width:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:T3,fontSize:"13px",lineHeight:1,pointerEvents:"none"}}>◈</span>
                <input value={pass} onChange={e=>setPass(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={nmInput} placeholder={tab==="reg" ? "придумайте пароль" : "пароль"} type="password"/>
              </div>
            )}
          </div>

          {tab==="reg" && registerStep !== "email" && (
            <div style={{marginTop:"6px", color:T3, fontSize:"10px", letterSpacing:"1px", lineHeight:1.5}}>
              {registerStep==="otp"
                ? "Введите 6-значный код, отправленный на email."
                : "Email подтвержден. Теперь задайте пароль для аккаунта."}
              <button
                type="button"
                onClick={() => {
                  setRegisterStep("email");
                  setOtp("");
                  setSetupToken("");
                  setPass("");
                }}
                style={{marginLeft:"8px", border:"none", background:"transparent", color:ACCENT, cursor:"pointer", fontFamily:"inherit", fontSize:"10px", letterSpacing:"1px", padding:0}}
              >
                изменить email
              </button>
            </div>
          )}

          {/* Forgot */}
          {tab==="in" && (
            <div style={{textAlign:"right", marginTop:"10px"}}>
              <span style={{color:T3, fontSize:"11px", cursor:"pointer", letterSpacing:"1px"}}>забыл пароль?</span>
            </div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={loading} style={{
            width:"100%", marginTop:"24px", padding:"14px",
            background: loading ? BG : ACCENT,
            boxShadow: loading ? SH_IN : `0 4px 20px ${ACCENT}55, ${SH_SM}`,
            color: loading ? T3 : "#fff",
            border:"none", borderRadius:"14px",
            fontSize:"12px", cursor: loading ? "default" : "pointer",
            fontFamily:"'Courier New',monospace",
            letterSpacing:"3px",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all .25s",
          }}>
            {loading
              ? <span style={{display:"flex", alignItems:"center", justifyContent:"center", width:"100%"}}>
                  <span style={{display:"inline-flex", alignItems:"center", transform:"translateX(5px)"}}>
                    <span style={{display:"inline-flex", alignItems:"center", justifyContent:"center", width:"18px", flex:"0 0 18px"}}><Whale size={18}/></span>
                    <span aria-hidden="true" style={{display:"inline-block", width:"8px", flex:"0 0 8px"}} />
                    <span style={{letterSpacing:"2px"}}>{loadingLabel}</span>
                    <span aria-hidden="true" style={{display:"inline-block", width:"26px", flex:"0 0 26px"}} />
                  </span>
                </span>
              : submitLabel
            }
          </button>
          {authError ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "14px",
                color: "#f472b6",
                fontSize: "11px",
                letterSpacing: "1px",
                lineHeight: 1.4,
              }}
            >
              {authError}
            </div>
          ) : null}
        </div>

        {/* Tagline */}
        <div style={{textAlign:"center", marginTop:"32px", color:T3, fontSize:"10px", letterSpacing:"2px"}}>
          ПИШИТЕ ИСТОРИИ. НЕ ОБЪЯСНЕНИЯ.
        </div>
      </div>
    </div>
  );
}
