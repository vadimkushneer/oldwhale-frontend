// @ts-nocheck
/**
 * Onboarding screen (wheel selector). Extracted from the generated
 * legacyUiBundle.tsx:7184-7440 without behavior changes. The inline `BG`,
 * `SURF`, `SH_OUT`, `SH_IN`, `SH_SM`, `T1`, `T2`, `T3` constants now come
 * from src/legacy/ui/tokens; the Whale logo comes from src/legacy/ui/Whale.
 *
 * `@ts-nocheck` matches the generated bundle so the hand-written extraction
 * does not introduce a stricter type contract than the rest of the legacy
 * UI. Typing lands in a later pass once the visuals are locked in.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { BG, SURF, SH_OUT, SH_IN, SH_SM, T1, T2, T3 } from "../../ui/tokens";
import { Whale } from "../../ui/Whale";

const WHEEL_ITEMS = [
  { num:"01", id:"note",    label:"Notebook",      desc:"Мысли набегу. Без структуры, без правил — просто пишешь.",                     color:"#f472b6", mode:"note"  },
  { num:"02", id:"film",    label:"Сценарий",  desc:"Сценарий по голливудскому стандарту. ИИ рядом — подсказывает, не мешает.",  color:"#34d399", mode:"film"  },
  { num:"03", id:"play",    label:"Пьеса",     desc:"Диалог как действие. Редактор думает вместе с драматургом.",                   color:"#7c6af7", mode:"play"  },
  { num:"04", id:"content", label:"Видео",     desc:"Быстрые идеи, чёткая структура. Фокус на смысл, а не на оформление.",         color:"#fbbf24", mode:"short" },
  { num:"05", id:"media",   label:"Медиа",        desc:"Rundown для ТВ, шоу, интервью. Сегменты, синхроны, ВТР — всё на месте.",      color:"#60a5fa", mode:"media" },
  { num:"06", id:"tiktok",  label:"ТИКТОК-ролик", desc:"Короткий вертикальный формат: зацепка, смысл, финал — текст под монтаж и озвучку.", color:"#fe2c55", mode:"short" },
];

export function Onboarding({ onSelect }) {
  const [active, setActive] = useState(0);
  const dragRef = useRef(null);
  const containerRef = useRef(null);
  const ITEM_H = 76;
  const N = WHEEL_ITEMS.length;

  const clamp = (v) => Math.max(0, Math.min(N - 1, v));
  const lastWheelRef = useRef(0);
  const wheelAccRef  = useRef(0);

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      wheelAccRef.current += e.deltaY;
      const now = Date.now();
      if (now - lastWheelRef.current < 180) return;
      lastWheelRef.current = now;
      const step = wheelAccRef.current > 0 ? 1 : -1;
      wheelAccRef.current = 0;
      setActive(a => clamp(a + step));
    };
    const onTouchStart = (e) => {
      dragRef.current = { y: e.touches[0].clientY, lastActive: active };
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (!dragRef.current) return;
      const dy = e.touches[0].clientY - dragRef.current.y;
      const steps = Math.round(-dy / 64);
      setActive(clamp(dragRef.current.lastActive + steps));
    };
    const onTouchEnd = () => { dragRef.current = null; };

    document.addEventListener('wheel',      onWheel,      { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove',  onTouchMove,  { passive: false });
    document.addEventListener('touchend',   onTouchEnd);
    return () => {
      document.removeEventListener('wheel',      onWheel);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove',  onTouchMove);
      document.removeEventListener('touchend',   onTouchEnd);
    };
  }, [active]);

  // Pointer drag — whole screen
  const onPointerDown = useCallback((e) => {
    dragRef.current = { y: e.clientY, lastActive: active };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [active]);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const dy = e.clientY - dragRef.current.y;
    const steps = Math.round(-dy / 64);
    setActive(clamp(dragRef.current.lastActive + steps));
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const item = WHEEL_ITEMS[active];

  return (
    <div ref={containerRef}
      style={{
      background:BG, minHeight:"100vh",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'Courier New',monospace", overflow:"hidden",
      userSelect:"none", touchAction:"none",
    }}
    >

      {/* LOGO */}
      <div style={{
        position:"absolute", top:"28px", left:"50%", transform:"translateX(-50%)",
        display:"flex", alignItems:"center",
      }}>
        <div style={{
          width:"30px", height:"30px", borderRadius:"50%",
          background:SURF, boxShadow:SH_SM,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Whale size={18}/>
        </div>
        <span style={{color:T1, fontSize:"12px", letterSpacing:"6px"}}>OLD WHALE</span>
      </div>

      {/* MAIN ROW */}
      <div style={{
        display:"flex", alignItems:"center",
        width:"100%", maxWidth:"600px", padding:"0 32px",
        boxSizing:"border-box", height:`${N * ITEM_H}px`, position:"relative",
      }}>

        {/* WHEEL */}
        <div
          style={{ width:"160px", flexShrink:0, height:"100%", position:"relative", cursor:"grab" }}
        >
          {/* Circle arc — numbers on circle, fading away from active */}
          {(() => {
            const R = 180;          // circle radius
            const CX = -R + 55;     // circle center x (off-screen left)
            const H = N * ITEM_H;
            const CY = H / 2;       // circle center y = mid of container
            const STEP_DEG = 18;    // degrees between items

            // For SVG arc: compute points on circle
            const pts = WHEEL_ITEMS.map((_, i) => {
              const deg = (i - active) * STEP_DEG;
              const rad = (deg * Math.PI) / 180;
              return {
                x: CX + R * Math.cos(rad),
                y: CY + R * Math.sin(rad),
                deg,
              };
            });

            // Build arc path through all points (partial circle)
            const arcPath = pts.map((p, i) => {
              const deg = (i - active) * STEP_DEG;
              const rad = (deg * Math.PI) / 180;
              const x = CX + R * Math.cos(rad);
              const y = CY + R * Math.sin(rad);
              return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `A ${R} ${R} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(' ');

            return (
              <>
                <svg width="160" height={H}
                  style={{position:"absolute",top:0,left:0,pointerEvents:"none",overflow:"visible"}}>
                  <defs>
                    <linearGradient id="arcFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={T3} stopOpacity="0"/>
                      <stop offset="30%"  stopColor={T3} stopOpacity="0.5"/>
                      <stop offset="50%"  stopColor={T3} stopOpacity="0.7"/>
                      <stop offset="70%"  stopColor={T3} stopOpacity="0.5"/>
                      <stop offset="100%" stopColor={T3} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d={arcPath} stroke="url(#arcFade)" strokeWidth="1" fill="none"/>
                  {pts.map((p, i) => {
                    const dist = Math.abs(i - active);
                    const op = i === active ? 1 : Math.max(0, 0.6 - dist * 0.15);
                    return (
                      <circle key={i}
                        cx={p.x.toFixed(1)} cy={p.y.toFixed(1)}
                        r={i === active ? 4 : 2.5}
                        fill={i === active ? item.color : T3}
                        opacity={op}
                        style={{transition:"all .35s"}}
                      />
                    );
                  })}
                </svg>

                {/* Numbers — positioned right of each dot */}
                {WHEEL_ITEMS.map((w, i) => {
                  const p = pts[i];
                  const dist = Math.abs(i - active);
                  const scale = i === active ? 1 : Math.max(0.4, 1 - dist * 0.2);
                  const opacity = i === active ? 1 : Math.max(0.12, 0.55 - dist * 0.15);
                  return (
                    <div key={w.id}
                      onClick={() => setActive(i)}
                      style={{
                        position:"absolute",
                        top:`${p.y}px`,
                        left:`${Math.max(p.x + 10, 8)}px`,
                        transform:`translateY(-50%) scale(${scale})`,
                        transformOrigin:"left center",
                        fontSize: i === active ? "44px" : "24px",
                        fontWeight:"300",
                        color: i === active ? w.color : T3,
                        opacity,
                        transition:"all .35s cubic-bezier(.4,0,.2,1)",
                        letterSpacing:"2px", lineHeight:"1",
                        cursor:"pointer",
                        fontFamily:"'Courier New',monospace",
                      }}
                    >
                      {w.num}
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>

        {/* RIGHT: info */}
        <div style={{
          flex:1, paddingLeft:"36px",
          display:"flex", flexDirection:"column",
        }}>
          <div style={{color:T1, fontSize:"32px", fontWeight:"300", letterSpacing:"1px", lineHeight:"1.1", transition:"all .3s"}}>
            {item.label}
          </div>
          <div style={{color:T2, fontSize:"13px", lineHeight:"1.7", maxWidth:"200px", transition:"all .3s"}}>
            {item.desc}
          </div>
          {item.mode !== null && (
            <button
              onClick={() => onSelect(item)}
              style={{
                marginTop:"12px", padding:"11px 22px",
                background:SURF, boxShadow:SH_OUT,
                border:"none", borderRadius:"12px",
                color:item.color, fontSize:"11px", letterSpacing:"3px",
                cursor:"pointer", fontFamily:"'Courier New',monospace",
                width:"fit-content", transition:"box-shadow .2s",
              }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=SH_IN}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=SH_OUT}
            >
              НАЧАТЬ →
            </button>
          )}
          {item.id === "login" && (
            <button
              onClick={() => onSelect({...item, mode:"film"})}
              style={{
                marginTop:"12px", padding:"11px 22px",
                background:SURF, boxShadow:SH_OUT,
                border:"none", borderRadius:"12px",
                color:item.color, fontSize:"11px", letterSpacing:"3px",
                cursor:"pointer", fontFamily:"'Courier New',monospace",
                width:"fit-content",
              }}
            >
              ВОЙТИ →
            </button>
          )}
        </div>
      </div>

      {/* HINT */}
      <div style={{
        position:"absolute", bottom:"28px",
        color:T3, fontSize:"10px", letterSpacing:"2px",
        display:"flex", alignItems:"center",
      }}>
        <span style={{fontSize:"16px"}}>↕</span> КРУТИ ДЛЯ ВЫБОРА
      </div>
    </div>
  );
}
