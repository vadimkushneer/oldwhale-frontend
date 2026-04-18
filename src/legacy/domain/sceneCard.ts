// @ts-nocheck
/**
 * Scene-card metadata catalog + normalization helpers.
 *
 * Extracted verbatim from reference.html MODULE: scene-card. Consumed by
 * EditorScreen (scene cards overlay, meta editor) and by ActTempoSparkline
 * (buildMetricPath). Kept in domain/ so it stays alongside blocks.tsx and
 * ai.ts as pure data + helpers without React dependencies.
 */

export const SCENE_CARD_COLOR_OPTIONS = [
  { id:"none", label:"Без цвета", value:null },
  { id:"sand", label:"Песок", value:"#caa46a" },
  { id:"amber", label:"Янтарь", value:"#f59e0b" },
  { id:"rose", label:"Роза", value:"#f472b6" },
  { id:"red", label:"Алый", value:"#ef4444" },
  { id:"violet", label:"Фиолет", value:"#8b5cf6" },
  { id:"blue", label:"Синий", value:"#60a5fa" },
  { id:"cyan", label:"Циан", value:"#22d3ee" },
  { id:"green", label:"Зелёный", value:"#4ade80" },
];
export const SCENE_CARD_STATUS_OPTIONS = [
  { id:"idea", label:"идея" },
  { id:"draft", label:"черновик" },
  { id:"progress", label:"в работе" },
  { id:"done", label:"готово" },
];
export const SCENE_CARD_FUNCTION_OPTIONS = [
  { id:"prologue", label:"пролог" },
  { id:"exposition", label:"экспозиция" },
  { id:"inciting", label:"завязка" },
  { id:"conflict", label:"конфликт" },
  { id:"barrier", label:"барьер" },
  { id:"escalation", label:"эскалация" },
  { id:"turn", label:"поворот" },
  { id:"choice", label:"выбор" },
  { id:"crisis", label:"кризис" },
  { id:"climax", label:"кульминация" },
  { id:"resolution", label:"развязка" },
  { id:"bridge", label:"связка" },
  { id:"payoff", label:"пэйофф" },
  { id:"epilogue", label:"эпилог" },
];

export const cloneSceneCardMetaMap = (meta) => Object.fromEntries(
  Object.entries(meta || {}).map(([id, value]) => [id, { ...(value || {}) }])
);
export const normalizeSceneCardTagValue = (value) => String(value || "").replace(/^#+/, "").trim();
export const clampSceneCardTempo = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(5, Math.round(n)));
};
export const clampSceneCardEmotion = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(5, Math.round(n)));
};
export const buildMetricPath = (points) => {
  let path = "";
  let started = false;
  points.forEach(pt => {
    if (pt.y == null) {
      started = false;
      return;
    }
    path += `${started ? "L" : "M"}${pt.x} ${pt.y} `;
    started = true;
  });
  return path.trim();
};
