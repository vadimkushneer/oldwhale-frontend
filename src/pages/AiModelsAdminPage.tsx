import type { CSSProperties } from "react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  useCreateAiGroupMutation,
  useCreateAiVariantMutation,
  useDeleteAiGroupMutation,
  useDeleteAiVariantMutation,
  useGetAdminAiGroupsQuery,
  usePatchAiGroupMutation,
  usePatchAiVariantMutation,
  useReorderAiGroupsMutation,
  useReorderAiVariantsMutation,
} from "../features/ai-catalog/aiCatalogApi";
import { useAppSelector } from "../hooks";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import type { AiGroupAdmin, AiVariantAdmin } from "../api/types";
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

function sortGroups(gs: AiGroupAdmin[]) {
  return [...gs].sort((a, b) => a.position - b.position || a.id - b.id);
}

function sortVariants(vs: AiVariantAdmin[]) {
  return [...vs].sort((a, b) => a.position - b.position || a.id - b.id);
}

export function AiModelsAdminPage() {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();
  const { data: rawGroups = [], isLoading, refetch } = useGetAdminAiGroupsQuery(undefined, {
    skip: !token || user?.role !== "admin",
  });
  const groups = useMemo(() => sortGroups(rawGroups), [rawGroups]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = groups.find((g) => g.id === selectedId) ?? null;

  const [dragGroupId, setDragGroupId] = useState<number | null>(null);
  const [dragVariantId, setDragVariantId] = useState<number | null>(null);

  const [createGroup, createGroupState] = useCreateAiGroupMutation();
  const [patchGroup, patchGroupState] = usePatchAiGroupMutation();
  const [deleteGroup, deleteGroupState] = useDeleteAiGroupMutation();
  const [reorderGroups, reorderGroupsState] = useReorderAiGroupsMutation();
  const [createVariant, createVariantState] = useCreateAiVariantMutation();
  const [patchVariant, patchVariantState] = usePatchAiVariantMutation();
  const [deleteVariant, deleteVariantState] = useDeleteAiVariantMutation();
  const [reorderVariants, reorderVariantsState] = useReorderAiVariantsMutation();

  const [gSlug, setGSlug] = useState("");
  const [gLabel, setGLabel] = useState("");
  const [gErr, setGErr] = useState<string | null>(null);

  const [vSlug, setVSlug] = useState("");
  const [vLabel, setVLabel] = useState("");
  const [vErr, setVErr] = useState<string | null>(null);

  const busy =
    createGroupState.isLoading ||
    patchGroupState.isLoading ||
    deleteGroupState.isLoading ||
    reorderGroupsState.isLoading ||
    createVariantState.isLoading ||
    patchVariantState.isLoading ||
    deleteVariantState.isLoading ||
    reorderVariantsState.isLoading;

  const onReorderGroups = useCallback(
    async (ids: number[]) => {
      try {
        await reorderGroups({ ids }).unwrap();
        await refetch();
      } catch (e: unknown) {
        console.error(e);
      }
    },
    [reorderGroups, refetch],
  );

  const onReorderVariants = useCallback(
    async (groupId: number, ids: number[]) => {
      try {
        await reorderVariants({ groupId, ids }).unwrap();
        await refetch();
      } catch (e: unknown) {
        console.error(e);
      }
    },
    [reorderVariants, refetch],
  );

  if (!token) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/admin/ai-models", search: "" } }} />;
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
    return <Navigate to="/login" replace state={{ from: { pathname: "/admin/ai-models", search: "" } }} />;
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
        <Link to="/editor" style={{ marginTop: 28, color: ACCENT, fontSize: 11, letterSpacing: 2, textDecoration: "none" }}>
          ← К РЕДАКТОРУ
        </Link>
      </div>
    );
  }

  async function onCreateGroup(e: FormEvent) {
    e.preventDefault();
    setGErr(null);
    if (gSlug.trim().length < 2 || gLabel.trim().length < 1) {
      setGErr("slug ≥2, label обязателен");
      return;
    }
    try {
      await createGroup({ slug: gSlug.trim(), label: gLabel.trim() }).unwrap();
      setGSlug("");
      setGLabel("");
      await refetch();
    } catch (err: unknown) {
      setGErr(err && typeof err === "object" && "data" in err ? String((err as { data?: { error?: string } }).data?.error || err) : String(err));
    }
  }

  async function onCreateVariant(e: FormEvent) {
    e.preventDefault();
    setVErr(null);
    if (!selected) return;
    if (vSlug.trim().length < 2) {
      setVErr("slug варианта ≥2");
      return;
    }
    try {
      await createVariant({
        groupId: selected.id,
        slug: vSlug.trim(),
        label: vLabel,
      }).unwrap();
      setVSlug("");
      setVLabel("");
      await refetch();
    } catch (err: unknown) {
      setVErr(err && typeof err === "object" && "data" in err ? String((err as { data?: { error?: string } }).data?.error || err) : String(err));
    }
  }

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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            НЕТ ПОДКЛЮЧЕНИЯ — ОПЕРАЦИИ НЕДОСТУПНЫ
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div style={{ letterSpacing: 4, fontSize: 12 }}>АДМИН · ИИ МОДЕЛИ</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link to="/admin" style={{ color: T2, fontSize: 10, letterSpacing: 2, textDecoration: "none" }}>
              ← ПОЛЬЗОВАТЕЛИ
            </Link>
            <Link to="/editor" style={{ color: ACCENT, fontSize: 10, letterSpacing: 2, textDecoration: "none" }}>
              РЕДАКТОР →
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ background: SURF, boxShadow: SH_OUT, borderRadius: 16, padding: 16 }}>
            <div style={{ color: T3, fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>ГРУППЫ (ПРОВАЙДЕРЫ)</div>
            {isLoading ? (
              <div style={{ color: T3, fontSize: 11 }}>ЗАГРУЗКА…</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {groups.map((g) => (
                  <div
                    key={g.id}
                    draggable={!busy}
                    onDragStart={() => setDragGroupId(g.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragGroupId == null || dragGroupId === g.id) return;
                      const ids = groups.map((x) => x.id);
                      const from = ids.indexOf(dragGroupId);
                      const to = ids.indexOf(g.id);
                      if (from < 0 || to < 0) return;
                      const next = [...ids];
                      next.splice(from, 1);
                      next.splice(to, 0, dragGroupId);
                      void onReorderGroups(next);
                      setDragGroupId(null);
                    }}
                    onClick={() => setSelectedId(g.id)}
                    style={{
                      borderRadius: 12,
                      padding: 10,
                      background: selectedId === g.id ? BG : "transparent",
                      boxShadow: selectedId === g.id ? SH_IN : "none",
                      cursor: "pointer",
                      border: `1px solid ${T3}33`,
                    }}
                  >
                    <GroupRow
                      group={g}
                      busy={busy}
                      onSave={async (body) => {
                        await patchGroup({ id: g.id, ...body }).unwrap();
                        await refetch();
                      }}
                      onDelete={async () => {
                        if (!window.confirm(`Удалить группу «${g.label}» и все варианты?`)) return;
                        await deleteGroup({ id: g.id }).unwrap();
                        if (selectedId === g.id) setSelectedId(null);
                        await refetch();
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={onCreateGroup} style={{ marginTop: 16, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr auto" }}>
              <input
                placeholder="slug (латиница)"
                value={gSlug}
                onChange={(e) => setGSlug(e.target.value)}
                style={inp}
              />
              <input placeholder="label" value={gLabel} onChange={(e) => setGLabel(e.target.value)} style={inp} />
              <button type="submit" disabled={busy || createGroupState.isLoading} style={btnPrimary}>
                + ГРУППА
              </button>
              {gErr ? <div style={{ gridColumn: "1 / -1", color: "#f472b6", fontSize: 11 }}>{gErr}</div> : null}
            </form>
          </div>

          <div style={{ background: SURF, boxShadow: SH_OUT, borderRadius: 16, padding: 16, minHeight: 320 }}>
            <div style={{ color: T3, fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>ВАРИАНТЫ</div>
            {!selected ? (
              <div style={{ color: T2, fontSize: 11 }}>Выберите группу слева</div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: T2, marginBottom: 12 }}>
                  Группа: <span style={{ color: T1 }}>{selected.label}</span> ({selected.slug})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {sortVariants(selected.variants).map((v) => (
                    <div
                      key={v.id}
                      draggable={!busy}
                      onDragStart={() => setDragVariantId(v.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragVariantId == null || dragVariantId === v.id) return;
                        const vs = sortVariants(selected.variants);
                        const ids = vs.map((x) => x.id);
                        const from = ids.indexOf(dragVariantId);
                        const to = ids.indexOf(v.id);
                        if (from < 0 || to < 0) return;
                        const next = [...ids];
                        next.splice(from, 1);
                        next.splice(to, 0, dragVariantId);
                        void onReorderVariants(selected.id, next);
                        setDragVariantId(null);
                      }}
                      style={{
                        borderRadius: 10,
                        padding: 8,
                        background: BG,
                        boxShadow: SH_IN,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr 1fr auto auto",
                        gap: 8,
                        alignItems: "center",
                        fontSize: 10,
                      }}
                    >
                      <input
                        type="radio"
                        name={`def-${selected.id}`}
                        checked={v.is_default}
                        onChange={() => void patchVariant({ id: v.id, is_default: true }).then(() => refetch())}
                        disabled={busy}
                      />
                      <input
                        defaultValue={v.slug}
                        key={`${v.id}-slug`}
                        id={`vs-${v.id}`}
                        style={{ ...inp, fontSize: 10 }}
                        onBlur={(e) => {
                          const nv = e.target.value.trim();
                          if (nv && nv !== v.slug) void patchVariant({ id: v.id, slug: nv }).then(() => refetch());
                        }}
                      />
                      <input
                        defaultValue={v.label}
                        key={`${v.id}-lab`}
                        style={{ ...inp, fontSize: 10 }}
                        onBlur={(e) => {
                          const nv = e.target.value;
                          if (nv !== v.label) void patchVariant({ id: v.id, label: nv }).then(() => refetch());
                        }}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void patchVariant({ id: v.id, is_default: true }).then(() => refetch())}
                        style={{ ...btnSm, background: T3, color: BG }}
                      >
                        DEF
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          if (!window.confirm(`Удалить вариант ${v.slug}?`)) return;
                          await deleteVariant({ id: v.id }).unwrap();
                          await refetch();
                        }}
                        style={{ ...btnSm, background: "#f472b6", color: "#1a1b2e" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={onCreateVariant} style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr auto" }}>
                  <input placeholder="slug варианта" value={vSlug} onChange={(e) => setVSlug(e.target.value)} style={inp} />
                  <input placeholder="label" value={vLabel} onChange={(e) => setVLabel(e.target.value)} style={inp} />
                  <button type="submit" disabled={busy} style={btnPrimary}>
                    + ВАРИАНТ
                  </button>
                  {vErr ? <div style={{ gridColumn: "1 / -1", color: "#f472b6", fontSize: 11 }}>{vErr}</div> : null}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inp: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: BG,
  boxShadow: SH_IN,
  border: "none",
  borderRadius: 8,
  color: T1,
  fontFamily: "inherit",
  fontSize: 11,
};

const btnPrimary: CSSProperties = {
  padding: "8px 12px",
  background: ACCENT,
  border: "none",
  borderRadius: 8,
  color: "#fff",
  letterSpacing: 1,
  fontSize: 9,
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnSm: CSSProperties = {
  padding: "4px 8px",
  border: "none",
  borderRadius: 6,
  fontSize: 9,
  cursor: "pointer",
  fontFamily: "inherit",
};

function GroupRow({
  group,
  busy,
  onSave,
  onDelete,
}: {
  group: AiGroupAdmin;
  busy: boolean;
  onSave: (body: { slug?: string; label?: string; role?: string; color?: string; free?: boolean }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [slug, setSlug] = useState(group.slug);
  const [label, setLabel] = useState(group.label);
  const [role, setRole] = useState(group.role);
  const [color, setColor] = useState(group.color);
  const [free, setFree] = useState(group.free);

  useEffect(() => {
    setSlug(group.slug);
    setLabel(group.label);
    setRole(group.role);
    setColor(group.color);
    setFree(group.free);
  }, [group.id, group.slug, group.label, group.role, group.color, group.free]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 9, color: T3 }}>⋮ drag строки группы</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} />
        <input value={label} onChange={(e) => setLabel(e.target.value)} style={inp} />
        <input value={role} onChange={(e) => setRole(e.target.value)} style={inp} />
        <input value={color} onChange={(e) => setColor(e.target.value)} style={inp} />
      </div>
      <label style={{ fontSize: 10, color: T2, display: "flex", alignItems: "center", gap: 6 }}>
        <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} disabled={busy} />
        free
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onSave({
              slug: slug.trim(),
              label: label.trim(),
              role: role.trim(),
              color: color.trim(),
              free,
            })
          }
          style={{ ...btnSm, background: "#34d399", color: "#0f172a" }}
        >
          СОХРАНИТЬ
        </button>
        <button type="button" disabled={busy} onClick={() => void onDelete()} style={{ ...btnSm, background: "#f472b6", color: "#1a1b2e" }}>
          УДАЛИТЬ ГРУППУ
        </button>
      </div>
    </div>
  );
}
