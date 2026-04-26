import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import type { AiGroupAdmin, AiVariantAdmin } from "../api/types";
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

function sortGroups(gs: AiGroupAdmin[]) {
  return [...gs].sort((a, b) => a.position - b.position || a.id - b.id);
}

function sortVariants(vs: AiVariantAdmin[]) {
  return [...vs].sort((a, b) => a.position - b.position || a.id - b.id);
}

/** 6-digit hex for native color input, or fallback when the field is not parseable as hex. */
function hexForColorInput(raw: string): string {
  const s = raw.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    const h = s.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  return "#000000";
}

/** CSS color for the swatch when the value looks like hex; otherwise undefined. */
function hexForSwatch(raw: string): string | undefined {
  const s = raw.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s;
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    const h = s.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  return undefined;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const surfaceShadowClassName =
  "[box-shadow:8px_8px_22px_rgba(0,0,0,0.5),-4px_-4px_12px_rgba(255,255,255,0.038)]";
const insetShadowClassName =
  "[box-shadow:inset_3px_3px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(255,255,255,0.035)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7c6af7]";
const panelClassName = cx(
  "rounded-2xl bg-[#1f2040] p-4",
  surfaceShadowClassName,
);
const inputBaseClassName = cx(
  "w-full rounded-lg border-0 bg-[#1a1b2e] px-[10px] py-2 font-mono text-[#e4e1f5] caret-[#7c6af7]",
  "placeholder:text-[#5a587a]",
  insetShadowClassName,
  focusRingClassName,
  "disabled:cursor-not-allowed disabled:opacity-60",
);
const inputClassName = cx(inputBaseClassName, "text-[11px]");
const denseInputClassName = cx(inputBaseClassName, "min-w-0 text-[10px]");
const buttonBaseClassName = cx(
  "inline-flex cursor-pointer items-center justify-center border-0 font-mono transition-colors duration-150",
  focusRingClassName,
  "disabled:cursor-not-allowed disabled:opacity-60",
);
const primaryButtonClassName = cx(
  buttonBaseClassName,
  "rounded-lg bg-[#7c6af7] px-3 py-2 text-[9px] tracking-[1px] text-white hover:bg-[#8a7bff]",
);
const smallButtonClassName = cx(
  buttonBaseClassName,
  "rounded-[6px] px-2 py-1 text-[9px]",
);
const neutralButtonClassName = cx(
  smallButtonClassName,
  "bg-[#5a587a] text-[#1a1b2e] hover:bg-[#6a6890]",
);
const successButtonClassName = cx(
  smallButtonClassName,
  "bg-[#34d399] text-[#0f172a] hover:bg-[#43e1ab]",
);
const dangerButtonClassName = cx(
  smallButtonClassName,
  "bg-[#f472b6] text-[#1a1b2e] hover:bg-[#fb7fc1]",
);

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
  const selectedVariants = useMemo(
    () => (selected ? sortVariants(selected.variants) : []),
    [selected],
  );

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
      <div className="ai-models-admin ai-models-admin--restoring flex min-h-screen items-center justify-center bg-[#1a1b2e] px-5 font-mono text-[11px] tracking-[2px] text-[#5a587a]">
        <div className="ai-models-admin__restore-message">
          ВОССТАНОВЛЕНИЕ СЕССИИ…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/admin/ai-models", search: "" } }} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="ai-models-admin ai-models-admin--forbidden flex min-h-screen flex-col items-center justify-center bg-[#1a1b2e] p-6 font-mono text-[#e4e1f5]">
        <div className="ai-models-admin__forbidden-title mb-3 text-[14px] tracking-[2px]">
          НЕДОСТАТОЧНО ПРАВ
        </div>
        <Link
          to="/editor"
          className="ai-models-admin__forbidden-link mt-7 text-[11px] tracking-[2px] text-[#7c6af7] no-underline transition-colors duration-150 hover:text-[#978bff]"
        >
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
    <div className="ai-models-admin min-h-screen bg-[#1a1b2e] px-5 pb-10 pt-6 font-mono text-[#e4e1f5]">
      <div className="ai-models-admin__container mx-auto max-w-[1100px]">
        {!online ? (
          <div
            className={cx(
              "ai-models-admin__status-banner ai-models-admin__status-banner--offline mb-4 rounded-xl bg-[#1f2040] px-[14px] py-[10px] text-[11px] tracking-[1px] text-[#f472b6]",
              surfaceShadowClassName,
            )}
          >
            НЕТ ПОДКЛЮЧЕНИЯ — ОПЕРАЦИИ НЕДОСТУПНЫ
          </div>
        ) : null}
        <div className="ai-models-admin__toolbar mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="ai-models-admin__title text-[12px] tracking-[4px]">
            АДМИН · ИИ МОДЕЛИ
          </div>
          <div className="ai-models-admin__toolbar-nav flex items-center gap-4">
            <Link
              to="/admin"
              className="ai-models-admin__toolbar-link ai-models-admin__toolbar-link--muted text-[10px] tracking-[2px] text-[#9896b8] no-underline transition-colors duration-150 hover:text-[#e4e1f5]"
            >
              ← ПОЛЬЗОВАТЕЛИ
            </Link>
            <Link
              to="/editor"
              className="ai-models-admin__toolbar-link ai-models-admin__toolbar-link--accent text-[10px] tracking-[2px] text-[#7c6af7] no-underline transition-colors duration-150 hover:text-[#978bff]"
            >
              РЕДАКТОР →
            </Link>
          </div>
        </div>

        <div className="ai-models-admin__content grid grid-cols-2 items-start gap-4">
          <div
            className={cx(
              "ai-models-admin__panel ai-models-admin__panel--groups",
              panelClassName,
            )}
          >
            <div className="ai-models-admin__panel-title mb-3 text-[10px] tracking-[2px] text-[#5a587a]">
              ГРУППЫ (ПРОВАЙДЕРЫ)
            </div>
            {isLoading ? (
              <div className="ai-models-admin__loading-state text-[11px] text-[#5a587a]">
                ЗАГРУЗКА…
              </div>
            ) : (
              <div className="ai-models-admin__groups-list flex flex-col gap-2">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className={cx(
                      "ai-models-admin__group-card cursor-pointer rounded-xl border border-[#5a587a33] p-2.5 transition-colors",
                      selectedId === g.id
                        ? cx(
                            "ai-models-admin__group-card--selected bg-[#1a1b2e]",
                            insetShadowClassName,
                          )
                        : "ai-models-admin__group-card--idle bg-transparent",
                    )}
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
            <form
              onSubmit={onCreateGroup}
              className="ai-models-admin__group-create-form mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
            >
              <input
                className={cx(
                  "ai-models-admin__group-create-input ai-models-admin__group-create-input--slug",
                  inputClassName,
                )}
                placeholder="slug (латиница)"
                value={gSlug}
                onChange={(e) => setGSlug(e.target.value)}
              />
              <input
                className={cx(
                  "ai-models-admin__group-create-input ai-models-admin__group-create-input--label",
                  inputClassName,
                )}
                placeholder="label"
                value={gLabel}
                onChange={(e) => setGLabel(e.target.value)}
              />
              <button
                type="submit"
                disabled={busy || createGroupState.isLoading}
                className={cx(
                  "ai-models-admin__group-create-button ai-models-admin__group-create-button--primary",
                  primaryButtonClassName,
                )}
              >
                + ГРУППА
              </button>
              {gErr ? (
                <div className="ai-models-admin__group-create-error col-[1/-1] text-[11px] text-[#f472b6]">
                  {gErr}
                </div>
              ) : null}
            </form>
          </div>

          <div
            className={cx(
              "ai-models-admin__panel ai-models-admin__panel--variants min-h-[320px]",
              panelClassName,
            )}
          >
            <div className="ai-models-admin__panel-title mb-3 text-[10px] tracking-[2px] text-[#5a587a]">
              ВАРИАНТЫ
            </div>
            {!selected ? (
              <div className="ai-models-admin__empty-state text-[11px] text-[#9896b8]">
                Выберите группу слева
              </div>
            ) : (
              <>
                <div className="ai-models-admin__variants-group mb-3 text-[11px] text-[#9896b8]">
                  Группа:{" "}
                  <span className="ai-models-admin__variants-group-label text-[#e4e1f5]">
                    {selected.label}
                  </span>{" "}
                  ({selected.slug})
                </div>
                <div className="ai-models-admin__variants-list flex flex-col gap-2">
                  {selectedVariants.map((v) => (
                    <div
                      key={v.id}
                      className={cx(
                        "ai-models-admin__variant-row grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-[10px] bg-[#1a1b2e] p-2 text-[10px]",
                        insetShadowClassName,
                      )}
                      draggable={!busy}
                      onDragStart={() => setDragVariantId(v.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragVariantId == null || dragVariantId === v.id) return;
                        const ids = selectedVariants.map((x) => x.id);
                        const from = ids.indexOf(dragVariantId);
                        const to = ids.indexOf(v.id);
                        if (from < 0 || to < 0) return;
                        const next = [...ids];
                        next.splice(from, 1);
                        next.splice(to, 0, dragVariantId);
                        void onReorderVariants(selected.id, next);
                        setDragVariantId(null);
                      }}
                    >
                      <input
                        type="radio"
                        name={`def-${selected.id}`}
                        className={cx(
                          "ai-models-admin__variant-default-radio h-4 w-4 accent-[#7c6af7]",
                          focusRingClassName,
                        )}
                        checked={v.is_default}
                        onChange={() => void patchVariant({ id: v.id, is_default: true }).then(() => refetch())}
                        disabled={busy}
                      />
                      <input
                        defaultValue={v.slug}
                        key={`${v.id}-slug`}
                        className={cx(
                          "ai-models-admin__variant-input ai-models-admin__variant-input--slug",
                          denseInputClassName,
                        )}
                        onBlur={(e) => {
                          const nv = e.target.value.trim();
                          if (nv && nv !== v.slug) void patchVariant({ id: v.id, slug: nv }).then(() => refetch());
                        }}
                      />
                      <input
                        defaultValue={v.label}
                        key={`${v.id}-lab`}
                        className={cx(
                          "ai-models-admin__variant-input ai-models-admin__variant-input--label",
                          denseInputClassName,
                        )}
                        onBlur={(e) => {
                          const nv = e.target.value;
                          if (nv !== v.label) void patchVariant({ id: v.id, label: nv }).then(() => refetch());
                        }}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void patchVariant({ id: v.id, is_default: true }).then(() => refetch())}
                        className={cx(
                          "ai-models-admin__variant-button ai-models-admin__variant-button--default",
                          neutralButtonClassName,
                        )}
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
                        className={cx(
                          "ai-models-admin__variant-button ai-models-admin__variant-button--delete",
                          dangerButtonClassName,
                        )}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={onCreateVariant}
                  className="ai-models-admin__variant-create-form mt-3.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
                >
                  <input
                    className={cx(
                      "ai-models-admin__variant-create-input ai-models-admin__variant-create-input--slug",
                      inputClassName,
                    )}
                    placeholder="slug варианта"
                    value={vSlug}
                    onChange={(e) => setVSlug(e.target.value)}
                  />
                  <input
                    className={cx(
                      "ai-models-admin__variant-create-input ai-models-admin__variant-create-input--label",
                      inputClassName,
                    )}
                    placeholder="label"
                    value={vLabel}
                    onChange={(e) => setVLabel(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className={cx(
                      "ai-models-admin__variant-create-button ai-models-admin__variant-create-button--primary",
                      primaryButtonClassName,
                    )}
                  >
                    + ВАРИАНТ
                  </button>
                  {vErr ? (
                    <div className="ai-models-admin__variant-create-error col-[1/-1] text-[11px] text-[#f472b6]">
                      {vErr}
                    </div>
                  ) : null}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSlug(group.slug);
    setLabel(group.label);
    setRole(group.role);
    setColor(group.color);
    setFree(group.free);
  }, [group.id, group.slug, group.label, group.role, group.color, group.free]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      slug.trim() !== group.slug.trim() ||
      label.trim() !== group.label.trim() ||
      role.trim() !== group.role.trim() ||
      color.trim() !== group.color.trim() ||
      free !== group.free
    );
  }, [slug, label, role, color, free, group.slug, group.label, group.role, group.color, group.free]);

  return (
    <div className="ai-models-admin__group-editor flex flex-col gap-1.5">
      <div className="ai-models-admin__group-editor-hint text-[9px] text-[#5a587a]">
        ⋮ drag строки группы
      </div>
      <div className="ai-models-admin__group-editor-fields grid grid-cols-2 gap-1.5">
        <input
          className={cx(
            "ai-models-admin__group-editor-input ai-models-admin__group-editor-input--slug",
            inputClassName,
          )}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          className={cx(
            "ai-models-admin__group-editor-input ai-models-admin__group-editor-input--label",
            inputClassName,
          )}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className={cx(
            "ai-models-admin__group-editor-input ai-models-admin__group-editor-input--role",
            inputClassName,
          )}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <div
          role="group"
          aria-label="Цвет"
          className={cx(
            "ai-models-admin__group-editor-input ai-models-admin__group-editor-input--color",
            "flex w-full min-w-0 cursor-pointer items-stretch overflow-hidden rounded-lg border-0 bg-[#1a1b2e] p-0 font-mono text-[11px] text-[#e4e1f5]",
            insetShadowClassName,
            "focus-within:outline-none focus-within:ring-1 focus-within:ring-[#7c6af7]",
          )}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest(".ai-models-admin__group-editor-color-code")) {
              return;
            }
            colorInputRef.current?.click();
          }}
        >
          <input
            ref={colorInputRef}
            type="color"
            className="sr-only"
            tabIndex={-1}
            value={hexForColorInput(color)}
            onChange={(e) => setColor(e.target.value)}
          />
          <div
            className="pointer-events-none flex w-9 shrink-0 items-center justify-center border-r border-[#ffffff14] self-stretch"
            title="Выбрать цвет"
          >
            <span
              className="h-5 w-5 rounded border border-[#ffffff26] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]"
              style={{
                backgroundColor: hexForSwatch(color) ?? "#3d3f5c",
              }}
            />
          </div>
          <input
            className="ai-models-admin__group-editor-color-code min-w-0 flex-1 cursor-text border-0 bg-transparent px-[10px] py-2 font-mono text-[#e4e1f5] outline-none placeholder:text-[#5a587a] caret-[#7c6af7]"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Код цвета"
          />
        </div>
      </div>
      <label className="ai-models-admin__group-editor-toggle flex items-center gap-1.5 text-[10px] text-[#9896b8]">
        <input
          type="checkbox"
          className={cx(
            "ai-models-admin__group-editor-checkbox h-4 w-4 accent-[#7c6af7]",
            focusRingClassName,
          )}
          checked={free}
          onChange={(e) => setFree(e.target.checked)}
          disabled={busy}
        />
        <span className="ai-models-admin__group-editor-toggle-label">free</span>
      </label>
      <div className="ai-models-admin__group-editor-actions flex gap-2">
        <button
          type="button"
          disabled={busy || !hasUnsavedChanges}
          onClick={() =>
            onSave({
              slug: slug.trim(),
              label: label.trim(),
              role: role.trim(),
              color: color.trim(),
              free,
            })
          }
          className={cx(
            "ai-models-admin__group-editor-button ai-models-admin__group-editor-button--save",
            successButtonClassName,
          )}
        >
          СОХРАНИТЬ
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete()}
          className={cx(
            "ai-models-admin__group-editor-button ai-models-admin__group-editor-button--delete",
            dangerButtonClassName,
          )}
        >
          УДАЛИТЬ ГРУППУ
        </button>
      </div>
    </div>
  );
}
