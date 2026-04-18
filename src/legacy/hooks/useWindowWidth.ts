// @ts-nocheck
/**
 * Window width hook extracted from legacyUiBundle.tsx. SSR-safe initial
 * value so the legacy bundle imports cleanly even under a static analysis
 * pass that evaluates at module load.
 */
import { useState, useEffect } from "react";

export function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}
