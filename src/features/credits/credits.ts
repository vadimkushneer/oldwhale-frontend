/**
 * Shared vocabulary for the "credits" entity. The balance is measured in
 * "Krill" (ticker "OWK", for Old Whale Krill); these labels are reused by the
 * editor sidebar, the profile page and the admin control panel so the wording
 * stays consistent everywhere.
 */

/** Full unit name (latin), as defined by the product. */
export const CREDITS_UNIT_NAME = "Krill";

/** Localized unit name for the Russian UI. */
export const CREDITS_UNIT_NAME_RU = "Криль";

/** Compact ticker shown next to amounts. */
export const CREDITS_UNIT_SHORT = "OWK";

/**
 * Credits charged per request to a paid (non-free) model group. Kept in sync
 * with `CREDITS_PER_PAID_REQUEST` on the backend, which is the authority that
 * actually debits the balance.
 */
export const CREDITS_PER_PAID_REQUEST = 12;

/**
 * Preset top-up amounts (Krill) offered on the profile page. `1` (= 1 KZT, the
 * gateway minimum) is kept first as a cheap way to exercise the real VTB payment
 * flow end-to-end.
 */
export const CREDITS_TOPUP_PRESETS = [1, 100, 500, 1000] as const;

/** Renders a balance as e.g. `300 OWK`, clamping to a non-negative integer. */
export function formatCredits(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.trunc(amount)) : 0;
  return `${safe} ${CREDITS_UNIT_SHORT}`;
}
