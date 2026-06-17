import type { AiChatLogColumnKey, AiChatLogListParams, EditorMode } from "../../api/types";
import i18n from "../../i18n";

export const AI_CHAT_LOG_LIMIT = 50;

export const CHAT_LOG_COLUMN_STORAGE_KEY = "ow_admin_ai_chat_log_columns_v1";

export const CHAT_LOG_COLUMNS: AiChatLogColumnKey[] = [
  "id",
  "time",
  "user",
  "message",
  "reply",
  "model",
  "message_ids",
  "ip_ua",
  "editor_mode",
  "note_context",
];

export type AiChatLogFilterField = {
  key: string;
  label: string;
  placeholder?: string;
};

export function getAiChatLogFilterFields(): AiChatLogFilterField[] {
  const t = i18n.t.bind(i18n);
  return [
    { key: "id", label: t("admin.aiChatLogs.filters.recordId") },
    {
      key: "from",
      label: t("admin.aiChatLogs.filters.from"),
      placeholder: "2026-04-28T12:00",
    },
    {
      key: "to",
      label: t("admin.aiChatLogs.filters.to"),
      placeholder: "2026-04-29T12:00",
    },
    { key: "user_id", label: "USER ID" },
    { key: "group_slug", label: "GROUP SLUG" },
    { key: "variant_slug", label: "VARIANT SLUG" },
    { key: "message_contains", label: t("admin.aiChatLogs.filters.messageText") },
    { key: "reply_contains", label: t("admin.aiChatLogs.filters.replyText") },
    { key: "user_message_id", label: "USER MSG ID" },
    { key: "assistant_message_id", label: "ASSISTANT MSG ID" },
    { key: "client_ip", label: "CLIENT IP" },
    { key: "user_agent", label: "USER AGENT" },
    { key: "login_contains", label: t("admin.aiChatLogs.filters.loginFragment") },
    { key: "email_contains", label: t("admin.aiChatLogs.filters.emailFragment") },
    { key: "editor_mode", label: "EDITOR MODE", placeholder: "note|media|short|play|film" },
  ];
}

export function getColumnLabels(): Record<AiChatLogColumnKey, string> {
  const t = i18n.t.bind(i18n);
  return {
    id: "ID",
    time: t("admin.aiChatLogs.columns.time"),
    user: t("admin.aiChatLogs.columns.user"),
    message: t("admin.aiChatLogs.columns.message"),
    reply: t("admin.aiChatLogs.columns.reply"),
    model: t("admin.aiChatLogs.columns.model"),
    message_ids: t("admin.aiChatLogs.columns.messageIds"),
    ip_ua: "IP / UA",
    editor_mode: t("admin.aiChatLogs.columns.editorMode"),
    note_context: t("admin.aiChatLogs.columns.noteContext"),
  };
}

export function defaultColumnVisibility(): Record<AiChatLogColumnKey, boolean> {
  return Object.fromEntries(CHAT_LOG_COLUMNS.map((k) => [k, true])) as Record<
    AiChatLogColumnKey,
    boolean
  >;
}

export function isVisible(
  cols: Record<AiChatLogColumnKey, boolean>,
  key: AiChatLogColumnKey,
): boolean {
  return cols[key] !== false;
}

export function clipText(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

/** Build RFC3339 from `datetime-local` value or return trimmed string if already ISO-like. */
export function toRFC3339(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t)) {
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return t;
}

export function buildAiChatLogListParams(
  applied: Record<string, string>,
  page: number,
): AiChatLogListParams {
  const p: AiChatLogListParams = {
    limit: AI_CHAT_LOG_LIMIT,
    offset: page * AI_CHAT_LOG_LIMIT,
  };
  const g = (k: string) => applied[k]?.trim() ?? "";

  if (g("id")) {
    const n = parseInt(g("id"), 10);
    if (!Number.isNaN(n)) p.id = n;
  }
  const fromIso = toRFC3339(g("from"));
  if (fromIso) p.from = fromIso;
  const toIso = toRFC3339(g("to"));
  if (toIso) p.to = toIso;
  if (g("user_id")) {
    const n = parseInt(g("user_id"), 10);
    if (!Number.isNaN(n)) p.user_id = n;
  }
  if (g("group_slug")) p.group_slug = g("group_slug");
  if (g("variant_slug")) p.variant_slug = g("variant_slug");
  if (g("message_contains")) p.message_contains = g("message_contains");
  if (g("reply_contains")) p.reply_contains = g("reply_contains");
  if (g("user_message_id")) p.user_message_id = g("user_message_id");
  if (g("assistant_message_id")) p.assistant_message_id = g("assistant_message_id");
  if (g("client_ip")) p.client_ip = g("client_ip");
  if (g("user_agent")) p.user_agent = g("user_agent");
  if (g("login_contains")) p.login_contains = g("login_contains");
  if (g("email_contains")) p.email_contains = g("email_contains");
  const em = g("editor_mode").toLowerCase();
  if (em && ["note", "media", "short", "play", "film"].includes(em)) {
    p.editor_mode = em as EditorMode;
  }
  return p;
}
