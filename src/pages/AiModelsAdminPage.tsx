import { FormEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import type { AiGroupAdmin, AiVariantAdmin } from "../api/types";
import {
  useCreateAiGroupMutation,
  useCreateAiVariantMutation,
  useDeleteAiGroupMutation,
  useDeleteAiVariantMutation,
  useGetAdminAiGroupsQuery,
  useGetAdminAiModelProvidersQuery,
  useImportAdminAiModelsMutation,
  usePatchAiGroupMutation,
  usePatchAiVariantMutation,
  useReorderAiGroupsMutation,
  useReorderAiVariantsMutation,
  useVerifyAdminEnvVarMutation,
} from "../features/ai-catalog/aiCatalogApi";
import { detectLLMProvider, findDetectedLLMModelProvider } from "../features/ai-catalog/llmProviderDetection";
import { useAppSelector } from "../hooks";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { AiGroupCard } from "../components/AiGroupCard/AiGroupCard";
import { AiModelVariantsPanel } from "../components/AiModelVariantsPanel/AiModelVariantsPanel";

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

function isValidHttpUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.trim() !== "";
  } catch {
    return false;
  }
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
const apiKeyInputShellClassName = cx(
  "relative w-full min-w-0 overflow-hidden rounded-lg border-0 bg-[#1a1b2e]",
  insetShadowClassName,
  "focus-within:outline-none focus-within:ring-1 focus-within:ring-[#7c6af7]",
);
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
    refetchOnFocus: false,
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

  const onCreateVariant = useCallback(
    async (groupId: number, body: { slug: string; label: string }) => {
      await createVariant({
        groupId,
        slug: body.slug,
        label: body.label,
      }).unwrap();
      await refetch();
    },
    [createVariant, refetch],
  );

  const onPatchVariant = useCallback(
    async (id: number, body: { slug?: string; label?: string; is_default?: boolean }) => {
      try {
        await patchVariant({ id, ...body }).unwrap();
        await refetch();
      } catch (e: unknown) {
        console.error(e);
      }
    },
    [patchVariant, refetch],
  );

  const onDeleteVariant = useCallback(
    async (id: number) => {
      try {
        await deleteVariant({ id }).unwrap();
        await refetch();
      } catch (e: unknown) {
        console.error(e);
      }
    },
    [deleteVariant, refetch],
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

  return (
    <div className="ai-models-admin flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#1a1b2e] px-5 pb-10 pt-6 font-mono text-[#e4e1f5]">
      <div className="ai-models-admin__container mx-auto flex w-full max-w-[1100px] flex-1 min-h-0 flex-col overflow-hidden">
        {!online ? (
          <div
            className={cx(
              "ai-models-admin__status-banner ai-models-admin__status-banner--offline mb-4 shrink-0 rounded-xl bg-[#1f2040] px-[14px] py-[10px] text-[11px] tracking-[1px] text-[#f472b6]",
              surfaceShadowClassName,
            )}
          >
            НЕТ ПОДКЛЮЧЕНИЯ — ОПЕРАЦИИ НЕДОСТУПНЫ
          </div>
        ) : null}
        <div className="ai-models-admin__toolbar mb-5 flex shrink-0 flex-wrap items-center justify-between gap-3">
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
              to="/admin/ai-chat-logs"
              className="ai-models-admin__toolbar-link ai-models-admin__toolbar-link--muted text-[10px] tracking-[2px] text-[#9896b8] no-underline transition-colors duration-150 hover:text-[#e4e1f5]"
            >
              ЖУРНАЛ ИИ‑ЧАТА →
            </Link>
            <Link
              to="/editor"
              className="ai-models-admin__toolbar-link ai-models-admin__toolbar-link--accent text-[10px] tracking-[2px] text-[#7c6af7] no-underline transition-colors duration-150 hover:text-[#978bff]"
            >
              РЕДАКТОР →
            </Link>
          </div>
        </div>

        <div className="ai-models-admin__content grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)] items-stretch gap-4 overflow-hidden">
          <div
            className={cx(
              "ai-models-admin__panel ai-models-admin__panel--groups flex min-h-0 flex-col overflow-hidden",
              panelClassName,
            )}
          >
            <div className="ai-models-admin__panel-title mb-3 shrink-0 text-[10px] tracking-[2px] text-[#5a587a]">
              ГРУППЫ (ПРОВАЙДЕРЫ)
            </div>
            {isLoading ? (
              <div className="ai-models-admin__loading-state shrink-0 text-[11px] text-[#5a587a]">
                ЗАГРУЗКА…
              </div>
            ) : (
              <div className="ai-models-admin__groups-list ow-app-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {groups.map((g) => (
                  <AiGroupCard
                    key={g.id}
                    groupId={g.id}
                    isSelected={selectedId === g.id}
                    busy={busy}
                    orderedGroupIds={groups.map((x) => x.id)}
                    dragGroupId={dragGroupId}
                    onDragGroupIdChange={setDragGroupId}
                    onSelectGroup={setSelectedId}
                    onReorderGroupIds={(ids) => void onReorderGroups(ids)}
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
                  </AiGroupCard>
                ))}
              </div>
            )}
            <form
              onSubmit={onCreateGroup}
              className="ai-models-admin__group-create-form mt-4 shrink-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
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
              "ai-models-admin__panel ai-models-admin__panel--variants flex min-h-0 flex-col overflow-hidden",
              panelClassName,
            )}
          >
            <div className="ai-models-admin__panel-title mb-3 shrink-0 text-[10px] tracking-[2px] text-[#5a587a]">
              ВАРИАНТЫ
            </div>
            {!selected ? (
              <div className="ai-models-admin__empty-state shrink-0 text-[11px] text-[#9896b8]">
                Выберите группу слева
              </div>
            ) : (
              <AiModelVariantsPanel
                group={selected}
                variants={selectedVariants}
                busy={busy}
                dragVariantId={dragVariantId}
                onDragVariantIdChange={setDragVariantId}
                onCreateVariant={onCreateVariant}
                onPatchVariant={onPatchVariant}
                onDeleteVariant={onDeleteVariant}
                onReorderVariantIds={onReorderVariants}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const envVarIconButtonClassName =
  "flex h-full aspect-square shrink-0 items-center justify-center rounded-md border border-[#ffffff14] bg-[#232438] text-[15px] leading-none text-[#e4e1f5] transition-colors hover:border-[#7c6af766] disabled:pointer-events-none disabled:opacity-35";

function GroupRow({
  group,
  busy,
  onSave,
  onDelete,
}: {
  group: AiGroupAdmin;
  busy: boolean;
  onSave: (body: {
    slug?: string;
    label?: string;
    role?: string;
    color?: string;
    free?: boolean;
    apiKey?: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [slug, setSlug] = useState(group.slug);
  const [label, setLabel] = useState(group.label);
  const [role, setRole] = useState(group.role);
  const [color, setColor] = useState(group.color);
  const [free, setFree] = useState(group.free);
  const [apiKey, setApiKey] = useState(group.apiKey ?? "");
  const [envPreview, setEnvPreview] = useState(false);
  const [resolvedValue, setResolvedValue] = useState<string | null>(null);
  const [revealValue, setRevealValue] = useState(false);
  type VerifyUi = "idle" | "loading" | "ok" | "missing" | "error";
  const [verifyUi, setVerifyUi] = useState<VerifyUi>("idle");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const apiKeyFieldId = useId();
  const modelsUrlFieldId = useId();
  const [verifyEnv, verifyEnvState] = useVerifyAdminEnvVarMutation();
  const [importModels, importModelsState] = useImportAdminAiModelsMutation();
  const verifyLoading = verifyEnvState.isLoading;
  const importLoading = importModelsState.isLoading;
  const { data: aiModelProvidersData } = useGetAdminAiModelProvidersQuery(undefined, {
    skip: !envPreview,
    refetchOnFocus: false,
  });
  const aiModelProviders = aiModelProvidersData?.providers ?? [];
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [modelsUrl, setModelsUrl] = useState("");
  const [modelsUrlWasEdited, setModelsUrlWasEdited] = useState(false);
  type ModelsUrlStatus = "idle" | "unchecked" | "ok" | "error";
  const [modelsUrlStatus, setModelsUrlStatus] = useState<ModelsUrlStatus>("idle");
  const [modelsImportMessage, setModelsImportMessage] = useState<string | null>(null);

  useEffect(() => {
    setSlug(group.slug);
    setLabel(group.label);
    setRole(group.role);
    setColor(group.color);
    setFree(group.free);
    setApiKey(group.apiKey ?? "");
    setEnvPreview(false);
    setResolvedValue(null);
    setRevealValue(false);
    setVerifyUi("idle");
    setSelectedProviderId("");
    setModelsUrl("");
    setModelsUrlWasEdited(false);
    setModelsUrlStatus("idle");
    setModelsImportMessage(null);
  }, [group.id, group.slug, group.label, group.role, group.color, group.free, group.apiKey]);

  useEffect(() => {
    if (aiModelProviders.length === 0 || modelsUrlWasEdited) return;
    const matchedByUrl = aiModelProviders.find((p) => p.modelsUrl === modelsUrl);
    if (matchedByUrl) {
      if (selectedProviderId !== matchedByUrl.id) {
        setSelectedProviderId(matchedByUrl.id);
      }
      return;
    }
    if (selectedProviderId || modelsUrl.trim() !== "" || !resolvedValue) return;

    const detectedProvider = findDetectedLLMModelProvider(
      aiModelProviders,
      detectLLMProvider(resolvedValue),
    );
    if (!detectedProvider) return;

    setSelectedProviderId(detectedProvider.id);
    setModelsUrl(detectedProvider.modelsUrl);
    setModelsUrlStatus("unchecked");
  }, [aiModelProviders, modelsUrl, modelsUrlWasEdited, resolvedValue, selectedProviderId]);

  const resetEnvVerify = useCallback(() => {
    setEnvPreview(false);
    setResolvedValue(null);
    setRevealValue(false);
    setVerifyUi("idle");
  }, []);

  const onApiKeyNameChange = useCallback(
    (v: string) => {
      setApiKey(v);
      resetEnvVerify();
      setSelectedProviderId("");
      setModelsUrl("");
      setModelsUrlWasEdited(false);
      setModelsUrlStatus("idle");
      setModelsImportMessage(null);
    },
    [resetEnvVerify],
  );

  const runVerify = useCallback(async () => {
    const name = apiKey.trim();
    if (!name || busy) return;
    setVerifyUi("loading");
    setModelsUrlStatus("idle");
    setModelsImportMessage(null);
    try {
      const r = await verifyEnv({ name }).unwrap();
      if (r.found) {
        const resolved = r.value ?? "";
        setResolvedValue(resolved);
        setEnvPreview(true);
        setRevealValue(true);
        setVerifyUi("ok");
      } else {
        setEnvPreview(false);
        setResolvedValue(null);
        setRevealValue(false);
        setVerifyUi("missing");
      }
    } catch {
      setEnvPreview(false);
      setResolvedValue(null);
      setRevealValue(false);
      setVerifyUi("error");
    }
  }, [apiKey, busy, verifyEnv]);

  const verifyEmoji =
    verifyUi === "loading" || verifyLoading
      ? "⏳"
      : verifyUi === "ok"
        ? "✅"
        : verifyUi === "missing" || verifyUi === "error"
          ? "❌"
          : "🔎";

  /** After verify, toggle between env var name (false) and resolved value from server (true). */
  const envPreviewShowsValue = envPreview && revealValue;
  const envKeyInputValue = envPreview ? (revealValue ? (resolvedValue ?? "") : apiKey) : apiKey;
  const modelsUrlValid = isValidHttpUrl(modelsUrl);
  const canImportModels =
    verifyUi === "ok" &&
    envPreview &&
    modelsUrl.trim() !== "" &&
    modelsUrlValid &&
    !busy &&
    !verifyLoading &&
    !importLoading;

  const onModelsUrlChange = useCallback(
    (value: string) => {
      setModelsUrlWasEdited(true);
      setModelsUrl(value);
      setModelsImportMessage(null);
      const matched = aiModelProviders.find((p) => p.modelsUrl === value);
      if (matched) {
        setSelectedProviderId(matched.id);
      }
      setModelsUrlStatus("unchecked");
    },
    [aiModelProviders],
  );

  const runImportModels = useCallback(async () => {
    if (!canImportModels) return;
    setModelsUrlStatus("unchecked");
    setModelsImportMessage(null);
    try {
      const r = await importModels({
        groupId: group.id,
        providerId: selectedProviderId,
        modelsUrl: modelsUrl.trim(),
        envVarName: apiKey.trim(),
      }).unwrap();
      setModelsUrlStatus("ok");
      setModelsImportMessage(`Импортировано моделей: ${r.imported}`);
    } catch (err: unknown) {
      setModelsUrlStatus("error");
      setModelsImportMessage(
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error || "Не удалось получить модели")
          : "Не удалось получить модели",
      );
    }
  }, [apiKey, canImportModels, group.id, importModels, modelsUrl, selectedProviderId]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      slug.trim() !== group.slug.trim() ||
      label.trim() !== group.label.trim() ||
      role.trim() !== group.role.trim() ||
      color.trim() !== group.color.trim() ||
      free !== group.free ||
      apiKey.trim() !== (group.apiKey ?? "").trim()
    );
  }, [slug, label, role, color, free, apiKey, group.slug, group.label, group.role, group.color, group.free, group.apiKey]);

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
        <div className="ai-models-admin__group-editor-field ai-models-admin__group-editor-field--api-key col-span-2 flex flex-col gap-1">
          <label
            className="ai-models-admin__group-editor-label ai-models-admin__group-editor-label--api-key text-[9px] tracking-[1px] text-[#5a587a]"
            htmlFor={apiKeyFieldId}
          >
            Переменная окружения, содержащая ключ API
          </label>
          <div
            className={cx(
              "ai-models-admin__group-editor-api-key-wrap",
              apiKeyInputShellClassName,
            )}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[1] flex w-9 shrink-0 items-center justify-center text-[15px] leading-none"
              aria-hidden={verifyUi === "idle"}
            >
              {verifyUi !== "idle" ? (
                <span className="select-none" aria-live="polite">
                  {verifyEmoji}
                </span>
              ) : null}
            </div>
            <input
              id={apiKeyFieldId}
              type="text"
              className={cx(
                "ai-models-admin__group-editor-input ai-models-admin__group-editor-input--api-key min-w-0 w-full border-0 bg-transparent py-2 font-mono text-[11px] text-[#e4e1f5] caret-[#7c6af7] outline-none ring-0 placeholder:text-[#5a587a]",
                "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                "disabled:cursor-not-allowed disabled:opacity-60",
                verifyUi === "idle" ? "pl-3" : "pl-9",
                envPreview ? "pr-[4.75rem]" : "pr-10",
              )}
              value={envKeyInputValue}
              onChange={
                envPreviewShowsValue
                  ? undefined
                  : (e) => {
                      onApiKeyNameChange(e.target.value);
                    }
              }
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (busy || verifyLoading || apiKey.trim() === "" || envPreviewShowsValue) return;
                void runVerify();
              }}
              placeholder="название переменной окружения"
              autoComplete="off"
              spellCheck={false}
              readOnly={envPreviewShowsValue}
              disabled={busy}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-max items-stretch gap-0.5 p-0.5">
              <div className="pointer-events-auto flex items-stretch gap-0.5">
                <button
                  type="button"
                  className={envVarIconButtonClassName}
                  title="Проверить переменную окружения на сервере"
                  disabled={busy || verifyLoading || apiKey.trim() === "" || envPreviewShowsValue}
                  onClick={() => void runVerify()}
                >
                  🔎
                </button>
                {envPreview ? (
                  <button
                    type="button"
                    className={envVarIconButtonClassName}
                    title={
                      revealValue
                        ? "Показать имя переменной окружения"
                        : "Показать значение из окружения сервера"
                    }
                    disabled={busy || verifyLoading}
                    onClick={() => setRevealValue((x) => !x)}
                  >
                    {revealValue ? "🙈" : "👁️"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          {envPreview ? (
            <div className="ai-models-admin__group-editor-models-check mt-1 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <div className="min-w-0">
                <label
                  className="ai-models-admin__group-editor-label ai-models-admin__group-editor-label--models-url mb-1 block text-[9px] tracking-[1px] text-[#5a587a]"
                  htmlFor={modelsUrlFieldId}
                >
                  URL списка моделей (models)
                </label>
                <input
                  id={modelsUrlFieldId}
                  type="url"
                  list={`${modelsUrlFieldId}-options`}
                  className={cx(
                    "ai-models-admin__group-editor-input ai-models-admin__group-editor-input--models-url",
                    inputClassName,
                    !modelsUrlValid && modelsUrl.trim() !== "" ? "text-[#f472b6]" : undefined,
                  )}
                  value={modelsUrl}
                  onChange={(e) => onModelsUrlChange(e.target.value)}
                  placeholder="https://api.anthropic.com/v1/models"
                  autoComplete="off"
                  inputMode="url"
                  spellCheck={false}
                  disabled={busy || verifyLoading || importLoading}
                />
                <datalist id={`${modelsUrlFieldId}-options`}>
                  {aiModelProviders.map((p) => (
                    <option key={p.id} value={p.modelsUrl} label={p.label} />
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                className={cx(
                  "ai-models-admin__group-editor-button ai-models-admin__group-editor-button--check-api-key self-end",
                  primaryButtonClassName,
                )}
                disabled={!canImportModels}
                onClick={() => void runImportModels()}
              >
                {importLoading ? "ПРОВЕРКА…" : "Проверить API-ключ 🔑"}
              </button>
              <div
                className={cx(
                  "ai-models-admin__group-editor-models-status col-[1/-1] text-[10px]",
                  modelsUrlStatus === "ok"
                    ? "text-[#34d399]"
                    : modelsUrlStatus === "error" || (!modelsUrlValid && modelsUrl.trim() !== "")
                      ? "text-[#f472b6]"
                      : "text-[#9896b8]",
                )}
              >
                {!modelsUrlValid && modelsUrl.trim() !== ""
                  ? "Введите корректный URL"
                  : modelsUrlStatus === "unchecked"
                    ? "URL не проверен"
                    : modelsUrlStatus === "ok"
                      ? (modelsImportMessage ?? "URL проверен")
                      : modelsUrlStatus === "error"
                        ? (modelsImportMessage ?? "Ошибка проверки")
                        : null}
              </div>
            </div>
          ) : null}
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
              apiKey: apiKey.trim(),
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
