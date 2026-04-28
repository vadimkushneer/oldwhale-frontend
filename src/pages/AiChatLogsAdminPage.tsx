import type { CSSProperties } from "react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import type { AiChatLogColumnKey, AiChatLogListParams, EditorMode } from "../api/types";
import {
  useLazyGetAdminUiSettingsQuery,
  useListAiChatLogsQuery,
  usePutAdminUiSettingsMutation,
} from "../features/admin/adminApi";
import { useAppSelector } from "../hooks";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import {
  ACCENT,
  BG,
  SH_IN,
  SH_OUT,
  SURF,
  T1,
  T2,
  T3,
} from "../legacy/ui/tokens";

const LIMIT = 50;

const CHAT_LOG_COLUMN_STORAGE_KEY = "ow_admin_ai_chat_log_columns_v1";

const CHAT_LOG_COLUMNS: AiChatLogColumnKey[] = [
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

const COLUMN_LABELS: Record<AiChatLogColumnKey, string> = {
  id: "ID",
  time: "ВРЕМЯ",
  user: "ПОЛЬЗОВАТЕЛЬ",
  message: "СООБЩЕНИЕ",
  reply: "ОТВЕТ",
  model: "МОДЕЛЬ",
  message_ids: "ID СООБЩ.",
  ip_ua: "IP / UA",
  editor_mode: "РЕЖИМ",
  note_context: "КОНТЕКСТ ЗАМЕТКИ",
};

function defaultColumnVisibility(): Record<AiChatLogColumnKey, boolean> {
  return Object.fromEntries(CHAT_LOG_COLUMNS.map((k) => [k, true])) as Record<AiChatLogColumnKey, boolean>;
}

function isVisible(cols: Record<AiChatLogColumnKey, boolean>, key: AiChatLogColumnKey) {
  return cols[key] !== false;
}

function inputStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "8px 10px",
    background: BG,
    boxShadow: SH_IN,
    border: "none",
    borderRadius: 8,
    color: T1,
    fontFamily: "inherit",
    fontSize: 10,
  };
}

function labelStyle(): CSSProperties {
  return { color: T3, fontSize: 9, letterSpacing: 1, marginBottom: 4 };
}

function clipText(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

/** Build RFC3339 from `datetime-local` value or return trimmed string if already ISO-like. */
function toRFC3339(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t)) {
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return t;
}

export function AiChatLogsAdminPage() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();

  const [fetchAdminUiSettings] = useLazyGetAdminUiSettingsQuery();
  const [putAdminUiSettings] = usePutAdminUiSettingsMutation();

  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<AiChatLogColumnKey, boolean>>(defaultColumnVisibility);

  const queryParams = useMemo((): AiChatLogListParams => {
    const p: AiChatLogListParams = {
      limit: LIMIT,
      offset: page * LIMIT,
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
  }, [applied, page]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    let cancelled = false;
    type LocalBlob = {
      v?: number;
      columns?: Partial<Record<AiChatLogColumnKey, boolean>>;
      dirty?: boolean;
      serverUpdatedAt?: string | null;
    };
    (async () => {
      let local: LocalBlob | null = null;
      try {
        const raw = localStorage.getItem(CHAT_LOG_COLUMN_STORAGE_KEY);
        if (raw) local = JSON.parse(raw) as LocalBlob;
      } catch {
        local = null;
      }
      const def = defaultColumnVisibility();
      const startCols = { ...def, ...(local?.columns ?? {}) };

      if (local?.dirty === true && local.columns) {
        try {
          const out = await putAdminUiSettings({
            aiChatLogTable: { columns: { ...def, ...local.columns } },
          }).unwrap();
          if (cancelled) return;
          try {
            localStorage.setItem(
              CHAT_LOG_COLUMN_STORAGE_KEY,
              JSON.stringify({
                v: 1,
                columns: { ...def, ...(out.aiChatLogTable?.columns ?? {}) },
                dirty: false,
                serverUpdatedAt: out.aiChatLogTable?.updated_at ?? null,
              }),
            );
          } catch {
            /* ignore */
          }
        } catch {
          if (!cancelled) setColumnVisibility(startCols);
          return;
        }
      }

      try {
        const srv = await fetchAdminUiSettings().unwrap();
        if (cancelled) return;
        const merged = { ...def, ...(srv.aiChatLogTable?.columns ?? {}) };
        setColumnVisibility(merged);
        try {
          localStorage.setItem(
            CHAT_LOG_COLUMN_STORAGE_KEY,
            JSON.stringify({
              v: 1,
              columns: merged,
              dirty: false,
              serverUpdatedAt: srv.aiChatLogTable?.updated_at ?? null,
            }),
          );
        } catch {
          /* ignore */
        }
      } catch {
        if (!cancelled) setColumnVisibility(startCols);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role, fetchAdminUiSettings, putAdminUiSettings]);

  const { data, isLoading, isFetching, error, refetch } = useListAiChatLogsQuery(queryParams, {
    skip: !token || user?.role !== "admin",
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const onApply = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setApplied({ ...draft });
      setPage(0);
    },
    [draft],
  );

  const onReset = useCallback(() => {
    setDraft({});
    setApplied({});
    setPage(0);
  }, []);

  const onToggleColumn = useCallback((key: AiChatLogColumnKey) => {
    setColumnVisibility((prev) => {
      const next = { ...prev, [key]: !isVisible(prev, key) };
      try {
        localStorage.setItem(
          CHAT_LOG_COLUMN_STORAGE_KEY,
          JSON.stringify({ v: 1, columns: next, dirty: true }),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: { pathname: "/admin/ai-chat-logs", search: "" } }} />
    );
  }

  if (restoreStatus !== "ready") {
    return (
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T3,
          fontFamily: "'Courier New',monospace",
          letterSpacing: "2px",
          fontSize: "11px",
        }}
      >
        ВОССТАНОВЛЕНИЕ СЕССИИ…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: { pathname: "/admin/ai-chat-logs", search: "" } }} />
    );
  }

  if (user.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          color: T1,
          fontFamily: "'Courier New',monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 2, marginBottom: 12 }}>НЕДОСТАТОЧНО ПРАВ</div>
        <Link to="/editor" style={{ color: ACCENT, fontSize: 11, letterSpacing: 2 }}>
          ← РЕДАКТОР
        </Link>
      </div>
    );
  }

  const rows = data?.items ?? [];
  const errMsg =
    error && typeof error === "object" && "data" in error
      ? String((error as { data?: { error?: string } }).data?.error ?? error)
      : error
        ? String(error)
        : null;

  const field = (key: string, label: string, placeholder?: string) => (
    <div>
      <div style={labelStyle()}>{label}</div>
      <input
        value={draft[key] ?? ""}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
        placeholder={placeholder}
        style={inputStyle()}
      />
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: T1,
        fontFamily: "'Courier New',monospace",
        padding: "24px 20px 40px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {!online ? (
          <div
            style={{
              background: SURF,
              boxShadow: SH_OUT,
              borderRadius: 12,
              padding: "10px 14px",
              color: "#f472b6",
              fontSize: 11,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            НЕТ ПОДКЛЮЧЕНИЯ — ДАННЫЕ МОГУТ БЫТЬ НЕАКТУАЛЬНЫ
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ letterSpacing: 4, fontSize: 12 }}>АДМИН · ЖУРНАЛ ИИ‑ЧАТА</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link to="/admin" style={{ color: T2, fontSize: 10, letterSpacing: 2, textDecoration: "none" }}>
              ← ПОЛЬЗОВАТЕЛИ
            </Link>
            <Link
              to="/admin/ai-models"
              style={{ color: T2, fontSize: 10, letterSpacing: 2, textDecoration: "none" }}
            >
              ИИ · МОДЕЛИ →
            </Link>
            <Link to="/editor" style={{ color: ACCENT, fontSize: 10, letterSpacing: 2, textDecoration: "none" }}>
              РЕДАКТОР →
            </Link>
          </div>
        </div>

        <form
          onSubmit={onApply}
          style={{
            background: SURF,
            boxShadow: SH_OUT,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            alignItems: "end",
          }}
        >
          {field("id", "ID ЗАПИСИ")}
          {field("from", "ОТ (RFC3339 / локальное)", "2026-04-28T12:00")}
          {field("to", "ДО (RFC3339 / локальное)", "2026-04-29T12:00")}
          {field("user_id", "USER ID")}
          {field("group_slug", "GROUP SLUG")}
          {field("variant_slug", "VARIANT SLUG")}
          {field("message_contains", "ТЕКСТ СООБЩЕНИЯ")}
          {field("reply_contains", "ТЕКСТ ОТВЕТА")}
          {field("user_message_id", "USER MSG ID")}
          {field("assistant_message_id", "ASSISTANT MSG ID")}
          {field("client_ip", "CLIENT IP")}
          {field("user_agent", "USER AGENT")}
          {field("login_contains", "ЛОГИН (ФРАГМЕНТ)")}
          {field("email_contains", "EMAIL (ФРАГМЕНТ)")}
          {field("editor_mode", "EDITOR MODE", "note|media|short|play|film")}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button
              type="submit"
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: ACCENT,
                color: "#fff",
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: 2,
                cursor: "pointer",
              }}
            >
              ПРИМЕНИТЬ
            </button>
            <button
              type="button"
              onClick={onReset}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "#5a587a",
                color: T1,
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: 1,
                cursor: "pointer",
              }}
            >
              СБРОС
            </button>
            <button
              type="button"
              onClick={() => void refetch()}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "#1a1b2e",
                boxShadow: SH_IN,
                color: T2,
                fontFamily: "inherit",
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              ОБНОВИТЬ
            </button>
          </div>
        </form>

        <div style={{ color: T3, fontSize: 10, marginBottom: 12, letterSpacing: 1 }}>
          Всего: {total}
          {isFetching ? " · загрузка…" : ""}
        </div>

        {errMsg ? (
          <div style={{ color: "#f472b6", fontSize: 11, marginBottom: 12 }}>{errMsg}</div>
        ) : null}

        <div
          style={{
            background: SURF,
            boxShadow: SH_OUT,
            borderRadius: 16,
            padding: 12,
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 14px",
            alignItems: "center",
          }}
        >
          <span style={{ color: T3, fontSize: 9, letterSpacing: 1, marginRight: 4 }}>КОЛОНКИ</span>
          {CHAT_LOG_COLUMNS.map((col) => (
            <label
              key={col}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                color: T2,
                fontSize: 9,
                letterSpacing: 0.5,
              }}
            >
              <input
                type="checkbox"
                checked={isVisible(columnVisibility, col)}
                onChange={() => onToggleColumn(col)}
              />
              {COLUMN_LABELS[col]}
            </label>
          ))}
        </div>

        <div style={{ overflowX: "auto", background: SURF, boxShadow: SH_OUT, borderRadius: 16, padding: 12 }}>
          {isLoading ? (
            <div style={{ color: T3, fontSize: 11 }}>ЗАГРУЗКА…</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ textAlign: "left", color: T3, letterSpacing: 1 }}>
                  {isVisible(columnVisibility, "id") ? (
                    <th style={{ padding: 8, whiteSpace: "nowrap" }}>{COLUMN_LABELS.id}</th>
                  ) : null}
                  {isVisible(columnVisibility, "time") ? (
                    <th style={{ padding: 8, whiteSpace: "nowrap" }}>{COLUMN_LABELS.time}</th>
                  ) : null}
                  {isVisible(columnVisibility, "user") ? (
                    <th style={{ padding: 8, whiteSpace: "nowrap" }}>{COLUMN_LABELS.user}</th>
                  ) : null}
                  {isVisible(columnVisibility, "message") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.message}</th>
                  ) : null}
                  {isVisible(columnVisibility, "reply") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.reply}</th>
                  ) : null}
                  {isVisible(columnVisibility, "model") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.model}</th>
                  ) : null}
                  {isVisible(columnVisibility, "message_ids") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.message_ids}</th>
                  ) : null}
                  {isVisible(columnVisibility, "ip_ua") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.ip_ua}</th>
                  ) : null}
                  {isVisible(columnVisibility, "editor_mode") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.editor_mode}</th>
                  ) : null}
                  {isVisible(columnVisibility, "note_context") ? (
                    <th style={{ padding: 8 }}>{COLUMN_LABELS.note_context}</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const noteTitle =
                    row.note_context != null ? JSON.stringify(row.note_context) : "";
                  const notePreview =
                    row.note_context != null ? clipText(JSON.stringify(row.note_context), 160) : "—";
                  return (
                    <tr key={row.id} style={{ borderTop: `1px solid ${BG}` }}>
                      {isVisible(columnVisibility, "id") ? (
                        <td style={{ padding: 8, verticalAlign: "top", whiteSpace: "nowrap" }}>{row.id}</td>
                      ) : null}
                      {isVisible(columnVisibility, "time") ? (
                        <td style={{ padding: 8, verticalAlign: "top", whiteSpace: "nowrap", color: T2 }}>
                          {row.created_at}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "user") ? (
                        <td style={{ padding: 8, verticalAlign: "top", color: T2 }}>
                          {row.user ? (
                            <>
                              {row.user.login}
                              <br />
                              <span style={{ fontSize: 9, color: T3 }}>{row.user.email}</span>
                            </>
                          ) : row.user_id != null ? (
                            `id:${row.user_id}`
                          ) : (
                            "—"
                          )}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "message") ? (
                        <td style={{ padding: 8, verticalAlign: "top", maxWidth: 280 }} title={row.message}>
                          {clipText(row.message, 200)}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "reply") ? (
                        <td style={{ padding: 8, verticalAlign: "top", maxWidth: 280 }} title={row.reply}>
                          {clipText(row.reply, 200)}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "model") ? (
                        <td
                          style={{ padding: 8, verticalAlign: "top", color: T2, maxWidth: 140 }}
                          title={`${row.group_slug} / ${row.variant_slug}`}
                        >
                          {row.group_slug}
                          <br />
                          {row.variant_slug}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "message_ids") ? (
                        <td
                          style={{ padding: 8, verticalAlign: "top", color: T3, fontSize: 9, maxWidth: 160 }}
                          title={`${row.user_message_id} · ${row.assistant_message_id}`}
                        >
                          {clipText(row.user_message_id, 36)}
                          <br />
                          {clipText(row.assistant_message_id, 36)}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "ip_ua") ? (
                        <td
                          style={{ padding: 8, verticalAlign: "top", color: T3, maxWidth: 200, fontSize: 9 }}
                          title={[row.client_ip ?? "", row.user_agent ?? ""].filter(Boolean).join(" · ")}
                        >
                          {row.client_ip ?? "—"}
                          <br />
                          {clipText(row.user_agent ?? "", 80)}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "editor_mode") ? (
                        <td style={{ padding: 8, verticalAlign: "top", color: T2 }}>
                          {row.editor_mode ?? "—"}
                        </td>
                      ) : null}
                      {isVisible(columnVisibility, "note_context") ? (
                        <td
                          style={{ padding: 8, verticalAlign: "top", maxWidth: 220, fontSize: 9, color: T3 }}
                          title={noteTitle}
                        >
                          {notePreview}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {total > LIMIT ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 20,
              justifyContent: "center",
              color: T2,
              fontSize: 11,
            }}
          >
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: 8,
                background: page <= 0 ? "#333" : SURF,
                color: T1,
                cursor: page <= 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              НАЗАД
            </button>
            <span>
              Стр. {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: 8,
                background: page + 1 >= totalPages ? "#333" : SURF,
                color: T1,
                cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              ДАЛЕЕ
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
