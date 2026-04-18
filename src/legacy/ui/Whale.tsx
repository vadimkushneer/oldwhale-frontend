import logoWhaleMain from "../../assets/logo-whale-main.png";

/**
 * Whale logo. Extracted from legacyUiBundle.tsx:369-373 without changes.
 * reference.html ships the same PNG as a data URL (LOGO_B64) which the
 * generator already rewrites to this Vite asset import at build time.
 */
export function Whale({ size = 36 }: { size?: number }) {
  return (
    <img
      src={logoWhaleMain}
      alt="Old Whale"
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}
