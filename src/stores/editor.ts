import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { BLOCK_DEFS } from "@/domain/blockDefs";
import { freshInit } from "@/domain/initBlocks";
import { AIR, AIM } from "@/domain/aiModels";
import { docStats, getScenes, noteDocStats } from "@/domain/scenes";
import { cloneBlocks, type ScriptBlock, uid } from "@/domain/scriptBlock";

export type ChatMsg = { role: "sys" | "user" | "ai"; text: string; model?: string };

const LS_INDEX = "ow_index";

export interface ProjectMeta {
  id: string;
  name: string;
  mode: string;
  updatedAt: number;
  blocksCount: number;
}

export const useEditorStore = defineStore("editor", () => {
  const mode = ref("film");
  const modeBlocksCache = ref<Record<string, ScriptBlock[]>>({});
  const blocks = ref<ScriptBlock[]>(freshInit("film"));

  const projectId = ref("proj_" + Date.now());
  const projectName = ref("Без названия");
  const saved = ref(true);

  const aiMod = ref<string>("deepseek");
  const credits = ref(340);
  const aiIn = ref("");
  const msgs = ref<ChatMsg[]>([
    { role: "sys", text: "Привет. Готов помочь с твоим сценарием. Что хочешь улучшить?" },
  ]);
  const aiLoad = ref(false);
  const aiOpen = ref(true);
  const aiW = ref(255);

  const noteText = ref("");
  const mobileTab = ref<"editor" | "scenes" | "ai">("editor");
  const menuOpen = ref(false);
  const focId = ref<number | null>(null);
  const lastFocId = shallowRef<number | null>(null);

  const history = ref<string[]>([]);
  const histIdx = ref(-1);

  const defs = computed(() => BLOCK_DEFS[mode.value] || []);
  const scenes = computed(() => getScenes(blocks.value, mode.value));
  const stats = computed(() =>
    mode.value === "note" ? noteDocStats(noteText.value) : docStats(blocks.value),
  );
  const mc = computed(() => AIM.find((x) => x.id === aiMod.value)?.color || "#7c6af7");

  function setFoc(id: number | null) {
    focId.value = id;
    if (id != null) lastFocId.value = id;
  }

  function switchMode(m: string) {
    modeBlocksCache.value[mode.value] = cloneBlocks(blocks.value);
    const cached = modeBlocksCache.value[m];
    blocks.value = cached?.length ? cloneBlocks(cached) : freshInit(m);
    mode.value = m;
    setFoc(null);
    menuOpen.value = false;
    pushHistory();
  }

  function pushHistory() {
    const snapshot = JSON.stringify(blocks.value);
    if (history.value[histIdx.value] === snapshot) return;
    history.value = history.value.slice(0, histIdx.value + 1);
    history.value.push(snapshot);
    if (history.value.length > 100) history.value.shift();
    histIdx.value = history.value.length - 1;
  }

  function undo() {
    if (histIdx.value <= 0 || history.value.length === 0) return;
    histIdx.value--;
    blocks.value = JSON.parse(history.value[histIdx.value]) as ScriptBlock[];
    saved.value = false;
  }

  function redo() {
    if (histIdx.value >= history.value.length - 1) return;
    histIdx.value++;
    blocks.value = JSON.parse(history.value[histIdx.value]) as ScriptBlock[];
    saved.value = false;
  }

  function updateBlockText(id: number, text: string) {
    const i = blocks.value.findIndex((b) => b.id === id);
    if (i < 0) return;
    blocks.value[i] = { ...blocks.value[i], text };
    markDirty();
  }

  function updateLineName(id: number, name: string) {
    const i = blocks.value.findIndex((b) => b.id === id);
    if (i < 0) return;
    blocks.value[i] = { ...blocks.value[i], name };
    markDirty();
  }

  function delBlock(id: number) {
    blocks.value = blocks.value.filter((b) => b.id !== id);
    if (focId.value === id) setFoc(null);
    markDirty();
  }

  function addAfter(afterId: number, type: string) {
    const i = blocks.value.findIndex((b) => b.id === afterId);
    if (i < 0) return;
    const nb: ScriptBlock = { id: uid(), type, text: "" };
    const next = [...blocks.value];
    next.splice(i + 1, 0, nb);
    blocks.value = next;
    markDirty();
    setFoc(nb.id);
  }

  function duplicateBlock(id: number) {
    const i = blocks.value.findIndex((b) => b.id === id);
    if (i < 0) return;
    const copy = { ...blocks.value[i], id: uid() };
    const next = [...blocks.value];
    next.splice(i + 1, 0, copy);
    blocks.value = next;
    markDirty();
  }

  function chType(id: number, newType: string) {
    const i = blocks.value.findIndex((b) => b.id === id);
    if (i < 0) return;
    blocks.value[i] = { ...blocks.value[i], type: newType };
    markDirty();
  }

  let saveT: ReturnType<typeof setTimeout> | null = null;
  let noteSaveT: ReturnType<typeof setTimeout> | null = null;

  function markDirty() {
    saved.value = false;
    pushHistory();
    if (saveT) clearTimeout(saveT);
    saveT = setTimeout(() => {
      saveProject();
      saved.value = true;
      saveT = null;
    }, 1500);
  }

  function touchNote() {
    saved.value = false;
    if (noteSaveT) clearTimeout(noteSaveT);
    noteSaveT = setTimeout(() => {
      saveProject();
      saved.value = true;
      noteSaveT = null;
    }, 1500);
  }

  function flushSave() {
    if (saveT) {
      clearTimeout(saveT);
      saveT = null;
    }
    saveProject();
    saved.value = true;
  }

  function saveProject() {
    try {
      const meta: ProjectMeta = {
        id: projectId.value,
        name: projectName.value,
        mode: mode.value,
        updatedAt: Date.now(),
        blocksCount: blocks.value.filter((b) => b.type === "scene").length,
      };
      const data = {
        ...meta,
        blocks: blocks.value,
        noteText: noteText.value,
      };
      localStorage.setItem("ow_proj_" + projectId.value, JSON.stringify(data));
      const index: ProjectMeta[] = JSON.parse(localStorage.getItem(LS_INDEX) || "[]");
      const next = [meta, ...index.filter((p) => p.id !== projectId.value)];
      localStorage.setItem(LS_INDEX, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function loadProject(id: string) {
    try {
      const raw = localStorage.getItem("ow_proj_" + id);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        blocks?: ScriptBlock[];
        name?: string;
        mode?: string;
        noteText?: string;
      };
      projectId.value = id;
      if (data.name) projectName.value = data.name;
      if (data.mode) mode.value = data.mode;
      if (data.blocks) blocks.value = data.blocks;
      if (data.noteText != null) noteText.value = data.noteText;
      history.value = [JSON.stringify(blocks.value)];
      histIdx.value = 0;
      saved.value = true;
    } catch {
      /* ignore */
    }
  }

  function newProject() {
    projectId.value = "proj_" + Date.now();
    projectName.value = "Без названия";
    blocks.value = freshInit(mode.value);
    noteText.value = "";
    history.value = [JSON.stringify(blocks.value)];
    histIdx.value = 0;
    saved.value = true;
  }

  function sendAi() {
    const q = aiIn.value.trim();
    if (!q) return;
    const m = AIM.find((x) => x.id === aiMod.value);
    if (m && !m.free && credits.value < 10) {
      msgs.value = [
        ...msgs.value,
        { role: "user", text: q },
        { role: "ai", text: "Недостаточно кредитов.", model: aiMod.value },
      ];
      aiIn.value = "";
      return;
    }
    msgs.value = [...msgs.value, { role: "user", text: q }];
    aiIn.value = "";
    aiLoad.value = true;
    setTimeout(() => {
      const rs = AIR[aiMod.value] || AIR.deepseek;
      msgs.value = [
        ...msgs.value,
        { role: "ai", text: rs[Math.floor(Math.random() * rs.length)], model: aiMod.value },
      ];
      aiLoad.value = false;
      if (m && !m.free) credits.value = Math.max(0, credits.value - 12);
    }, 1400);
  }

  function initFromProfile(defaultMode: string) {
    mode.value = defaultMode;
    blocks.value = freshInit(defaultMode);
    history.value = [JSON.stringify(blocks.value)];
    histIdx.value = 0;
  }

  return {
    mode,
    blocks,
    projectId,
    projectName,
    saved,
    aiMod,
    credits,
    aiIn,
    msgs,
    aiLoad,
    aiOpen,
    aiW,
    noteText,
    mobileTab,
    menuOpen,
    focId,
    lastFocId,
    defs,
    scenes,
    stats,
    mc,
    setFoc,
    switchMode,
    undo,
    redo,
    updateBlockText,
    updateLineName,
    delBlock,
    addAfter,
    duplicateBlock,
    chType,
    markDirty,
    saveProject,
    loadProject,
    newProject,
    sendAi,
    initFromProfile,
    pushHistory,
    touchNote,
    flushSave,
  };
});
