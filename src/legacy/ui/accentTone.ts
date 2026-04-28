const KNOWN_ACCENT_HEX_TO_TONE = {
  "#4ade80": "green",
  "#7c6af7": "violet",
  "#f472b6": "pink",
  "#f59e0b": "amber",
  "#60a5fa": "blue",
} as const;

export type AccentTone = (typeof KNOWN_ACCENT_HEX_TO_TONE)[keyof typeof KNOWN_ACCENT_HEX_TO_TONE];

export function normalizeAccentHex(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function accentToneFromHex(accent: string): AccentTone {
  const key = normalizeAccentHex(accent) as keyof typeof KNOWN_ACCENT_HEX_TO_TONE;
  return KNOWN_ACCENT_HEX_TO_TONE[key] ?? "violet";
}
