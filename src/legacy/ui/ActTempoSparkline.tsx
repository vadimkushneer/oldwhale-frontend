// @ts-nocheck
/**
 * Act / scene tempo + emotion sparkline.
 *
 * Extracted verbatim from reference.html MODULE: ActTempoSparkline. Accepts
 * `accent` and `T3` as props (same signature as in the reference) so the
 * color stays in sync with the caller's mode palette; `SURF` comes from the
 * shared tokens module and matches the inline reference constant.
 */
import React from "react";
import { SURF } from "./tokens";
import { buildMetricPath } from "../domain/sceneCard";

export function ActTempoSparkline({ items, accent, T3, compact=false }) {
  const height = compact ? 48 : 82;
  const padX = 12;
  const padY = compact ? 7 : 10;
  const stepX = items.length > 24 ? 14 : 16;
  const width = Math.max(320, padX * 2 + Math.max(0, items.length - 1) * stepX + 24);
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const midY = padY + innerH / 2;
  const emotionColor = "#7dd3fc";
  const toY = (value) => {
    if (value == null) return null;
    const ratio = (value - 1) / 4;
    return padY + innerH - ratio * innerH;
  };
  const pointsTempo = items.map((item, idx) => ({
    x: items.length <= 1 ? width / 2 : padX + (innerW * idx) / Math.max(1, items.length - 1),
    y: toY(item.tempo),
    item,
  }));
  const pointsEmotion = items.map((item, idx) => ({
    x: items.length <= 1 ? width / 2 : padX + (innerW * idx) / Math.max(1, items.length - 1),
    y: toY(item.emotion),
    item,
  }));
  const hasTempo = items.some(item => item.tempo != null);
  const hasEmotion = items.some(item => item.emotion != null);
  const tempoPath = buildMetricPath(pointsTempo);
  const emotionPath = buildMetricPath(pointsEmotion);
  return (
    <div style={{width:"100%", minWidth:compact?"220px":"260px", maxWidth:compact?"360px":"680px", marginLeft:"auto", alignSelf:"stretch"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", marginBottom:compact?"4px":"6px"}}>
        <div style={{display:"flex", alignItems:"center", gap:compact?"8px":"12px", flexWrap:"wrap"}}>
          <span style={{display:"flex", alignItems:"center", gap:"5px", color:T3, fontSize:compact?"8px":"9px", letterSpacing:compact?"1.2px":"1.6px"}}>
            <span style={{width:compact?"8px":"10px", height:"2px", borderRadius:"999px", background:accent || "#d4af7f", display:"inline-block"}} />
            ТЕМП
          </span>
          <span style={{display:"flex", alignItems:"center", gap:"5px", color:T3, fontSize:compact?"8px":"9px", letterSpacing:compact?"1.1px":"1.4px"}}>
            <span style={{width:compact?"8px":"10px", height:"2px", borderRadius:"999px", background:emotionColor, display:"inline-block"}} />
            ЭМОЦИЯ
          </span>
        </div>
        <span style={{color:T3, fontSize:compact?"8px":"9px"}}>{items.length}</span>
      </div>
      <div style={{overflowX:"auto", overflowY:"hidden", paddingBottom:compact?"0":"4px", scrollbarWidth:"thin"}}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{display:"block", width:`${width}px`, minWidth:"100%", height:compact?"48px":"82px", overflow:"visible"}}>
          <line x1={padX} y1={midY} x2={width-padX} y2={midY} stroke={T3+"33"} strokeWidth="1" strokeDasharray="3 4" />
          {[1,2,3,4,5].map(step => {
            const y = toY(step);
            return <line key={step} x1={padX} y1={y} x2={width-padX} y2={y} stroke={T3+"18"} strokeWidth="1" />;
          })}
          {tempoPath && <path d={tempoPath} fill="none" stroke={accent || "#d4af7f"} strokeWidth={compact ? 2 : 2.4} strokeLinejoin="round" strokeLinecap="round" opacity={hasTempo ? 0.92 : 0.35} />}
          {emotionPath && <path d={emotionPath} fill="none" stroke={emotionColor} strokeWidth={compact ? 1.7 : 2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={compact ? "4 3" : "5 4"} opacity={hasEmotion ? 0.88 : 0.3} />}
          {pointsTempo.map((pt, idx) => (
            <g key={pt.item.id || idx}>
              {pt.y != null && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={compact ? 2.3 : 2.9}
                  fill={accent || "#d4af7f"}
                  stroke="rgba(0,0,0,0.38)"
                  strokeWidth={1}
                />
              )}
              {pointsEmotion[idx]?.y != null && (
                <circle
                  cx={pointsEmotion[idx].x}
                  cy={pointsEmotion[idx].y}
                  r={compact ? 1.9 : 2.4}
                  fill={SURF}
                  stroke={emotionColor}
                  strokeWidth={1.4}
                />
              )}
              <title>{`${pt.item.label} · темп ${pt.item.tempo ?? "—"} · эмоция ${pt.item.emotion ?? "—"}`}</title>
            </g>
          ))}
          {!items.length && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={T3} fontSize="10">нет сцен</text>
          )}
        </svg>
      </div>
      {items.length > 0 && !hasTempo && !hasEmotion && (
        <div style={{color:T3, fontSize:compact?"8px":"9px", marginTop:"4px", textAlign:"right"}}>задай темп или эмоцию сценам</div>
      )}
    </div>
  );
}
