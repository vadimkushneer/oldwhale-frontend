import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AiChatLogColumnKey, AiChatLogItem } from "../../api/types";
import {
  useLazyGetAdminUiSettingsQuery,
  useListAiChatLogsQuery,
  usePutAdminUiSettingsMutation,
} from "../../features/admin/adminApi";
import { useAppSelector } from "../../hooks";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import {
  AI_CHAT_LOG_LIMIT,
  buildAiChatLogListParams,
  CHAT_LOG_COLUMN_STORAGE_KEY,
  defaultColumnVisibility,
  isVisible,
} from "./aiChatLogsAdminQuery";

type LocalColumnBlob = {
  v?: number;
  columns?: Partial<Record<AiChatLogColumnKey, boolean>>;
  dirty?: boolean;
  serverUpdatedAt?: string | null;
};

export type AiChatLogsAdminPhase =
  | "redirect-login"
  | "session-restore"
  | "forbidden"
  | "ready";

export type UseAiChatLogsAdminResult =
  | { phase: "redirect-login" }
  | { phase: "session-restore" }
  | { phase: "forbidden" }
  | {
      phase: "ready";
      online: boolean;
      draft: Record<string, string>;
      setDraft: Dispatch<SetStateAction<Record<string, string>>>;
      onApply: (e: FormEvent) => void;
      onReset: () => void;
      columnVisibility: Record<AiChatLogColumnKey, boolean>;
      onToggleColumn: (key: AiChatLogColumnKey) => void;
      total: number;
      totalPages: number;
      page: number;
      setPage: Dispatch<SetStateAction<number>>;
      rows: AiChatLogItem[];
      isLoading: boolean;
      isFetching: boolean;
      errMsg: string | null;
      refetch: () => void;
    };

export function useAiChatLogsAdmin(): UseAiChatLogsAdminResult {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();

  const [fetchAdminUiSettings] = useLazyGetAdminUiSettingsQuery();
  const [putAdminUiSettings] = usePutAdminUiSettingsMutation();

  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<AiChatLogColumnKey, boolean>>(
    defaultColumnVisibility,
  );

  const queryParams = useMemo(() => buildAiChatLogListParams(applied, page), [applied, page]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    let cancelled = false;
    (async () => {
      let local: LocalColumnBlob | null = null;
      try {
        const raw = localStorage.getItem(CHAT_LOG_COLUMN_STORAGE_KEY);
        if (raw) local = JSON.parse(raw) as LocalColumnBlob;
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

  const onApply = useCallback((e: FormEvent) => {
    e.preventDefault();
    setApplied({ ...draft });
    setPage(0);
  }, [draft]);

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
  const totalPages = Math.max(1, Math.ceil(total / AI_CHAT_LOG_LIMIT));

  const phase = useMemo((): AiChatLogsAdminPhase => {
    if (!token) return "redirect-login";
    if (restoreStatus !== "ready") return "session-restore";
    if (!user) return "redirect-login";
    if (user.role !== "admin") return "forbidden";
    return "ready";
  }, [token, restoreStatus, user]);

  if (phase === "redirect-login") {
    return { phase: "redirect-login" };
  }

  if (phase === "session-restore") {
    return { phase: "session-restore" };
  }

  if (phase === "forbidden") {
    return { phase: "forbidden" };
  }

  const errMsg =
    error && typeof error === "object" && "data" in error
      ? String((error as { data?: { error?: string } }).data?.error ?? error)
      : error
        ? String(error)
        : null;

  return {
    phase: "ready",
    online,
    draft,
    setDraft,
    onApply,
    onReset,
    columnVisibility,
    onToggleColumn,
    total,
    totalPages,
    page,
    setPage,
    rows: data?.items ?? [],
    isLoading,
    isFetching,
    errMsg,
    refetch,
  };
}
