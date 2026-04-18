// @ts-nocheck
/**
 * Tooltip bubble + hover/focus controller hook.
 *
 * Extracted verbatim from reference.html MODULE: tooltip. `T2` comes from
 * src/legacy/ui/tokens so the bubble's body color stays in sync with the
 * rest of the dark neumorphic palette. The rest of the module is
 * intentionally untouched so the visual baselines captured from
 * reference.html stay within tolerance.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { T2 } from "./tokens";

export const UI_TOOLTIP_SHOW_DELAY = 320;
export const UI_TOOLTIP_Y_OFFSET = 10;
export const UI_TOOLTIP_STORE_KEY = "ow_ui_tooltips_enabled_v1";

function clampTooltipX(x, text) {
  const width = Math.max(98, Math.min(240, text.length * 6.2 + 32));
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const pad = 12;
  return Math.max(pad + width / 2, Math.min(vw - pad - width / 2, x));
}

export function TooltipBubble({ tooltip }) {
  if (!tooltip?.visible) return null;
  return (
    <div
      style={{
        position:"fixed",
        left:`${tooltip.x}px`,
        top:`${tooltip.y}px`,
        transform:"translate(-50%, -100%)",
        pointerEvents:"none",
        zIndex:1200,
      }}
    >
      <div
        style={{
          padding:"7px 16px",
          borderRadius:"8px",
          background:"rgba(26,26,46,0.50)",
          border:"1px solid #4a5163",
          boxShadow:"0 10px 28px rgba(0,0,0,0.34)",
          color:T2,
          fontSize:"10px",
          lineHeight:"1.2",
          letterSpacing:"0.2px",
          whiteSpace:"nowrap",
                  }}
      >
        {tooltip.text}
      </div>
    </div>
  );
}

export function useTooltipController(enabled=true) {
  const [tooltip, setTooltip] = useState({ visible:false, text:"", x:0, y:0 });
  const showTimerRef = useRef(null);

  const clearShowTimer = useCallback(() => {
    if (!showTimerRef.current) return;
    clearTimeout(showTimerRef.current);
    showTimerRef.current = null;
  }, []);

  const hideTooltip = useCallback(() => {
    clearShowTimer();
    setTooltip(prev => prev.visible ? { ...prev, visible:false } : prev);
  }, [clearShowTimer]);

  const showTooltip = useCallback((target, text) => {
    if (!enabled || !target || !text) return;
    clearShowTimer();
    const node = target;
    showTimerRef.current = setTimeout(() => {
      const rect = node.getBoundingClientRect();
      const x = clampTooltipX(rect.left + rect.width / 2, text);
      const y = Math.max(18, rect.top - UI_TOOLTIP_Y_OFFSET);
      setTooltip({ visible:true, text, x, y });
      showTimerRef.current = null;
    }, UI_TOOLTIP_SHOW_DELAY);
  }, [enabled, clearShowTimer]);

  useEffect(() => () => clearShowTimer(), [clearShowTimer]);

  useEffect(() => {
    if (enabled) return;
    setTooltip(prev => prev.visible ? { ...prev, visible:false } : prev);
  }, [enabled]);

  useEffect(() => {
    if (!tooltip.visible) return;
    const dismiss = () => setTooltip(prev => prev.visible ? { ...prev, visible:false } : prev);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [tooltip.visible]);

  const getTooltipAnchorProps = useCallback((text) => ({
    onMouseEnter: enabled ? (e) => showTooltip(e.currentTarget, text) : hideTooltip,
    onMouseLeave: hideTooltip,
    onFocus: enabled ? (e) => showTooltip(e.currentTarget, text) : hideTooltip,
    onBlur: hideTooltip,
    onMouseDown: hideTooltip,
    onTouchStart: hideTooltip,
  }), [enabled, showTooltip, hideTooltip]);

  return { tooltip, hideTooltip, getTooltipAnchorProps };
}
