// @ts-nocheck
/**
 * AI provider catalog + chat-store helpers.
 *
 * Extracted verbatim from reference.html MODULE: ai-module. This file owns
 * `AIM` and `AIR` (previously duplicated inside src/legacy/domain/blocks.tsx),
 * plus the newer model-variant catalog, localStorage-backed chat store, and
 * chat-meta helpers consumed by EditorScreen's AI panel / history dropdown.
 */

const FALLBACK_AIM = [
  { id:"deepseek", label:"DeepSeek", role:"Черновик",  color:"#4ade80", free:true  },
  { id:"claude",   label:"Claude",   role:"Редактура", color:"#7c6af7", free:false },
  { id:"gpt",      label:"GPT",      role:"Идеи",      color:"#f472b6", free:false },
  { id:"grok",     label:"Grok",     role:"Идеи",      color:"#f59e0b", free:false },
  { id:"gemini",   label:"Gemini",   role:"Идеи",      color:"#60a5fa", free:false },
];
const FALLBACK_VARIANTS = {
  claude: [
    { id:"claude-opus-4-6", label:"Opus 4.6" },
    { id:"claude-sonnet-4-6", label:"Sonnet 4.6" },
    { id:"claude-haiku-4-5", label:"Haiku 4.5" },
  ],
  deepseek: [
    { id:"deepseek-v3-2", label:"V3.2" },
    { id:"deepseek-chat", label:"" },
    { id:"deepseek-v3-2-exp", label:"V3.2-Exp" },
    { id:"deepseek-v4", label:"V4" },
  ],
  gpt: [
    { id:"gpt-5-4-thinking", label:"GPT-5.4 Thinking" },
    { id:"gpt-5-4-pro", label:"GPT-5.4 Pro" },
    { id:"gpt-5-4-mini", label:"GPT-5.4 mini" },
  ],
  gemini: [
    { id:"gemini-3-flash", label:"Gemini-3-Flash" },
    { id:"gemini-3-pro", label:"Gemini-3-Pro" },
    { id:"gemini-1-5-pro", label:"Gemini-1.5-Pro" },
  ],
  grok: [
    { id:"grok-4-20", label:"Grok 4.20" },
    { id:"grok-4-1-fast", label:"Grok 4.1 Fast" },
    { id:"grok-4-1-fast-nr", label:"Grok 4.1 Fast NR" },
  ],
};

function cloneFallbackVariants() {
  const o = {};
  for (const k of Object.keys(FALLBACK_VARIANTS)) {
    o[k] = FALLBACK_VARIANTS[k].map((x) => ({ ...x }));
  }
  return o;
}

function defaultVariantsFromRecord(variantsByProvider) {
  return Object.fromEntries(
    Object.entries(variantsByProvider).map(([providerId, items]) => [
      providerId,
      (Array.isArray(items) && items[0]?.id) || "",
    ]),
  );
}

/** Live catalog (ESM live bindings); reassigned by `setAiCatalog`. */
export let AIM = FALLBACK_AIM.map((x) => ({ ...x }));
export let AI_MODEL_VARIANTS = cloneFallbackVariants();
export let AI_DEFAULT_MODEL_VARIANTS = defaultVariantsFromRecord(AI_MODEL_VARIANTS);

/**
 * Apply catalog from `GET /api/ai/models` (or cache). Each group `slug` becomes provider id in `AIM` / variant map keys.
 * @param {Array<{ slug: string; label: string; role: string; color: string; free: boolean; variants: Array<{ slug: string; label: string; is_default?: boolean }> }>} groups
 */
export function setAiCatalog(groups) {
  if (!Array.isArray(groups) || groups.length === 0) {
    AIM = FALLBACK_AIM.map((x) => ({ ...x }));
    AI_MODEL_VARIANTS = cloneFallbackVariants();
    AI_DEFAULT_MODEL_VARIANTS = defaultVariantsFromRecord(AI_MODEL_VARIANTS);
    return;
  }
  AIM = groups.map((g) => ({
    id: g.slug,
    label: g.label,
    role: g.role || "",
    color: g.color || "",
    free: Boolean(g.free),
  }));
  const vmap = {};
  const defmap = {};
  for (const g of groups) {
    const pid = g.slug;
    const vars = Array.isArray(g.variants) ? g.variants : [];
    vmap[pid] = vars.map((v) => ({ id: v.slug, label: v.label != null ? String(v.label) : "" }));
    const def = vars.find((v) => v.is_default);
    defmap[pid] = (def && def.slug) || vars[0]?.slug || "";
  }
  AI_MODEL_VARIANTS = vmap;
  AI_DEFAULT_MODEL_VARIANTS = defmap;
}

export const AIR = {
  deepseek:["Сцена хорошо открывается. Добавь деталь через действие — не через описание.","Диалог работает, но вторая реплика объясняет то что зритель уже понял. Срежь.","Начни с середины — брось зрителя в действие без предисловий."],
  claude:  ["Персонажу не хватает чёткого желания в этой сцене. Что она хочет?","Второй акт провисает. Нужен поворот — момент когда план рушится.","Диалог звучит написанным. Прочитай вслух — услышишь где спотыкается ритм."],
  gpt:     ["Что если сцена не в кофейне, а в месте которое само по себе метафора?","Что если Марина пишет письмо? Адресат неизвестен. Это меняет всё.","Что если дождь за окном — персонаж? Он что-то говорит ей. Что именно?"],
  grok:    ["Попробуй сдвинуть акцент: не что произошло, а что герой скрывает.","Сделай конфликт резче в первой же реплике.","Проверь, можно ли сократить сцену на треть без потери смысла."],
  gemini:  ["Разложи сцену на цель, препятствие и поворот.","Подумай, где здесь самый точный образ вместо объяснения.","Попробуй вариант, где подтекст важнее прямого смысла слов."],
};
export const AI_STORE_KEY = "ow_ai_chat_store_v1";
export const AI_HISTORY_LIMIT = 60;
export const AI_DEFAULT_MODEL = "deepseek";
export const AI_FILE_EXTS = ["txt", "docx", "fdx", "whale"];
export const AI_FILE_ACCEPT = ".txt,.docx,.fdx,.whale,text/plain,application/json,application/xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const AI_CAN_USE_EMOJI = true;
export const getAiProvider = (providerId=AI_DEFAULT_MODEL) => AIM.find(x=>x.id===providerId) || AIM.find(x=>x.id===AI_DEFAULT_MODEL) || AIM[0];
export const getAiVariants = (providerId=AI_DEFAULT_MODEL) => AI_MODEL_VARIANTS[providerId] || AI_MODEL_VARIANTS[AI_DEFAULT_MODEL] || [];
export const getDefaultAiVariant = (providerId=AI_DEFAULT_MODEL) => AI_DEFAULT_MODEL_VARIANTS[providerId] || getAiVariants(providerId)[0]?.id || "";
export const isAiVariantForProvider = (variantId, providerId=AI_DEFAULT_MODEL) => getAiVariants(providerId).some(v=>v.id===variantId);
export const normalizeAiModelVariant = (providerId=AI_DEFAULT_MODEL, variantId) => (
  isAiVariantForProvider(variantId, providerId) ? variantId : getDefaultAiVariant(providerId)
);
export const getAiVariant = (providerId=AI_DEFAULT_MODEL, variantId) => {
  const safeId = normalizeAiModelVariant(providerId, variantId);
  return getAiVariants(providerId).find(v=>v.id===safeId) || null;
};
export const getAiVariantMenuLabel = (providerId=AI_DEFAULT_MODEL, variant) => {
  if (!variant) return getAiProvider(providerId)?.label || "ИИ";
  if (providerId === "deepseek") return `Deepseek${variant.label ? ` ${variant.label}` : ""}`;
  return variant.label || getAiProvider(providerId)?.label || "ИИ";
};
export const getAiModelDisplayLabel = (providerId=AI_DEFAULT_MODEL, variantId, opts={}) => {
  const provider = getAiProvider(providerId);
  const variant = getAiVariant(provider.id, variantId);
  const withProvider = opts.withProvider !== false;
  if (!variant?.label) return provider?.label || "ИИ";
  return withProvider ? `${provider.label} · ${variant.label}` : variant.label;
};
export const makeAiGreeting = () => ({ role:"sys", text:"Привет. Готов помочь с твоим сценарием. Что хочешь улучшить?" });
export const makeAiChatId = () => `aichat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
export const cloneAiMessages = (messages) => {
  const safe = Array.isArray(messages)
    ? messages.filter(m=>m && typeof m.text === "string").map(m=>({ ...m }))
    : [];
  return safe.length ? safe : [makeAiGreeting()];
};
export const normalizeAiChat = (chat, fallbackModel=AI_DEFAULT_MODEL, fallbackModelVariant) => {
  const model = AIM.some(x=>x.id===chat?.model) ? chat.model : fallbackModel;
  const modelVariant = normalizeAiModelVariant(model, chat?.modelVariant || fallbackModelVariant);
  const messages = cloneAiMessages(chat?.messages).map(msg => {
    if (msg?.role !== "ai") return { ...msg };
    const msgModel = AIM.some(x=>x.id===msg?.model) ? msg.model : model;
    return {
      ...msg,
      model: msgModel,
      modelVariant: normalizeAiModelVariant(msgModel, msg?.modelVariant || (msgModel===model ? modelVariant : undefined)),
    };
  });
  return {
    id: typeof chat?.id === "string" && chat.id ? chat.id : makeAiChatId(),
    createdAt: Number.isFinite(chat?.createdAt) ? chat.createdAt : Date.now(),
    updatedAt: Number.isFinite(chat?.updatedAt) ? chat.updatedAt : Date.now(),
    model,
    modelVariant,
    messages,
  };
};
export const makeDefaultAiStore = () => ({
  current: normalizeAiChat({
    id: makeAiChatId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: AI_DEFAULT_MODEL,
    modelVariant: getDefaultAiVariant(AI_DEFAULT_MODEL),
    messages: [makeAiGreeting()],
  }, AI_DEFAULT_MODEL, getDefaultAiVariant(AI_DEFAULT_MODEL)),
  history: [],
});
export const hasAiChatContent = (chatOrMessages) => {
  const messages = Array.isArray(chatOrMessages) ? chatOrMessages : chatOrMessages?.messages;
  return Array.isArray(messages) && messages.some(m => m && m.role !== "sys" && typeof m.text === "string" && m.text.trim());
};
export const readAiStore = () => {
  try {
    const raw = localStorage.getItem(AI_STORE_KEY);
    if (!raw) return makeDefaultAiStore();
    const parsed = JSON.parse(raw);
    const current = normalizeAiChat(parsed?.current || {}, AI_DEFAULT_MODEL, getDefaultAiVariant(AI_DEFAULT_MODEL));
    const history = Array.isArray(parsed?.history)
      ? parsed.history.map(item=>normalizeAiChat(item, item?.model || current.model, item?.modelVariant || current.modelVariant)).filter(hasAiChatContent).slice(0, AI_HISTORY_LIMIT)
      : [];
    return { current, history };
  } catch (e) {
    return makeDefaultAiStore();
  }
};
export const writeAiStore = ({ current, history }) => {
  try {
    localStorage.setItem(AI_STORE_KEY, JSON.stringify({
      current: normalizeAiChat(current, current?.model || AI_DEFAULT_MODEL, current?.modelVariant || getDefaultAiVariant(current?.model || AI_DEFAULT_MODEL)),
      history: (Array.isArray(history) ? history : [])
        .map(item=>normalizeAiChat(item, item?.model || AI_DEFAULT_MODEL, item?.modelVariant || getDefaultAiVariant(item?.model || AI_DEFAULT_MODEL)))
        .filter(hasAiChatContent)
        .slice(0, AI_HISTORY_LIMIT),
    }));
  } catch (e) {}
};
export const getAiChatTitle = (chat) => {
  const first = (chat?.messages || []).find(m => m && m.role !== "sys" && typeof m.text === "string" && m.text.trim());
  const base = (first?.text || "Новый чат").replace(/\s+/g, " ").trim();
  return base.length > 42 ? base.slice(0, 42) + "…" : base;
};
export const formatAiChatStamp = (ts) => {
  try {
    return new Date(ts).toLocaleString("ru-RU", {
      day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"
    });
  } catch (e) {
    return "";
  }
};
export const getAiSpeakerLabel = (msg, fallbackModel=AI_DEFAULT_MODEL, fallbackModelVariant) => {
  if (msg?.role === "user") return "Ты";
  if (msg?.role === "sys") return "Система";
  const modelId = msg?.model || fallbackModel;
  const modelVariant = msg?.modelVariant || fallbackModelVariant;
  return getAiModelDisplayLabel(modelId, modelVariant);
};
export const buildAiPreviewText = (chat) => (chat?.messages || [])
  .filter(m=>m && typeof m.text === "string" && m.text.trim())
  .map(m=>`${getAiSpeakerLabel(m, chat?.model, chat?.modelVariant)}: ${m.text}`)
  .join("\n\n");
