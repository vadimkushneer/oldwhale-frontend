<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ow-content">
      <div class="flex h-full min-h-0 flex-col text-ow-t1">
        <!-- Top bar -->
        <header
          class="flex shrink-0 items-center justify-between gap-2 border-b border-white/5 px-3 py-2 md:px-4"
        >
          <div class="flex min-w-0 items-center gap-2">
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ow-surf shadow-ow-sm border-0 text-ow-t1"
              @click="menuOpen = !menuOpen"
            >
              <span class="text-lg leading-none">≡</span>
            </button>
            <WhaleMark :size="22" class="hidden text-ow-t2 sm:block" />
            <input
              v-model="editor.projectName"
              class="max-w-[140px] truncate border-0 bg-transparent font-mono text-xs tracking-wide text-ow-t1 outline-none sm:max-w-[220px] md:max-w-xs"
              @change="editor.saveProject"
            />
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="editor.saved ? 'bg-emerald-500/60' : 'bg-amber-400/80'"
              :title="editor.saved ? 'Сохранено' : 'Изменения…'"
            />
          </div>
          <div class="hidden items-center gap-1 md:flex">
            <button
              v-for="m in MODES_META"
              :key="m.id"
              type="button"
              class="flex items-center gap-1 rounded-lg border-0 px-2 py-1.5 font-mono text-[10px] tracking-wide transition-all"
              :class="
                editor.mode === m.id
                  ? 'bg-ow-bg text-ow-t1 shadow-ow-in'
                  : 'bg-transparent text-ow-t3'
              "
              @click="goMode(m.id)"
            >
              <ModeIcon :id="m.id" />
              {{ m.label }}
            </button>
          </div>
          <div class="text-[10px] text-ow-t3 font-mono hidden sm:block">
            {{ editor.stats.words }} слов · {{ editor.stats.timing }}
          </div>
        </header>

        <!-- Mobile mode strip -->
        <div class="flex gap-1 overflow-x-auto border-b border-white/5 px-2 py-1 md:hidden">
          <button
            v-for="m in MODES_META"
            :key="'m-' + m.id"
            type="button"
            class="shrink-0 rounded-lg border-0 px-2 py-1 font-mono text-[10px]"
            :class="editor.mode === m.id ? 'bg-ow-surf text-ow-t1' : 'text-ow-t3'"
            @click="goMode(m.id)"
          >
            {{ m.label }}
          </button>
        </div>

        <div class="flex min-h-0 flex-1">
          <!-- Scenes rail -->
          <aside
            v-show="!isMobile || editor.mobileTab === 'scenes'"
            class="w-[200px] shrink-0 overflow-y-auto border-r border-white/5 p-2 md:block md:w-[215px]"
            :class="{ hidden: isMobile && editor.mobileTab !== 'scenes' }"
          >
            <div class="mb-2 text-[9px] tracking-[2px] text-ow-t3">СЦЕНЫ</div>
            <button
              v-for="s in editor.scenes"
              :key="'s-' + s.id"
              type="button"
              class="mb-1 w-full rounded-lg border-0 px-2 py-2 text-left font-mono text-[11px] transition-colors"
              :class="
                editor.focId === s.id ? 'bg-ow-accent/20 text-ow-t1' : 'bg-ow-surf/50 text-ow-t2'
              "
              @click="scrollToScene(s.id)"
            >
              <div class="truncate font-bold">{{ sceneTitle(s) }}</div>
              <div v-if="s.cast" class="truncate text-[10px] text-ow-t3">{{ s.cast }}</div>
            </button>
          </aside>

          <!-- Editor canvas -->
          <main
            v-show="!isMobile || editor.mobileTab === 'editor'"
            class="min-w-0 flex-1 overflow-y-auto p-3 md:p-4"
            :class="{ hidden: isMobile && editor.mobileTab !== 'editor' }"
          >
            <div v-if="editor.mode === 'note'" class="mx-auto max-w-3xl">
              <textarea
                v-model="editor.noteText"
                class="min-h-[60vh] w-full resize-y rounded-xl border border-white/10 bg-ow-surf/40 p-4 font-mono text-sm leading-relaxed text-ow-t1 shadow-ow-in outline-none"
                placeholder="Пишите свободно…"
                @input="onNoteInput"
              />
            </div>
            <div v-else ref="scrollRef" class="mx-auto max-w-3xl pb-24">
              <div
                v-for="b in editor.blocks"
                :key="b.id"
                :data-scene-id="isSceneHeader(b) ? b.id : undefined"
                class="group relative"
              >
                <div
                  v-if="editor.defs.length && b.type !== 'spacer'"
                  class="pointer-events-none absolute -left-1 top-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <button
                    type="button"
                    class="pointer-events-auto rounded bg-ow-bg/90 px-1 text-[9px] text-ow-t3 border border-white/10"
                    @click="typeMenuId = typeMenuId === b.id ? null : b.id"
                  >
                    {{ blockDef(b)?.hotkey }}
                  </button>
                </div>
                <div
                  v-if="typeMenuId === b.id"
                  class="absolute left-0 top-8 z-20 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-ow-surf py-1 shadow-ow-out"
                >
                  <button
                    v-for="d in editor.defs"
                    :key="d.type + b.id"
                    type="button"
                    class="block w-full border-0 bg-transparent px-3 py-2 text-left font-mono text-[10px] text-ow-t2 hover:bg-ow-bg"
                    @click="
                      editor.chType(b.id, d.type);
                      typeMenuId = null;
                    "
                  >
                    {{ d.label }}
                  </button>
                </div>

                <div v-if="b.type === 'spacer'" class="h-6" />

                <template v-else-if="b.type === 'line'">
                  <div class="flex gap-2" :style="lineStyle(b)">
                    <input
                      class="w-28 shrink-0 border-0 bg-transparent font-mono text-[11px] uppercase text-ow-t2 outline-none"
                      :value="b.name || ''"
                      placeholder="ИМЯ"
                      @input="editor.updateLineName(b.id, ($event.target as HTMLInputElement).value)"
                    />
                    <textarea
                      :value="b.text"
                      rows="1"
                      class="min-h-[1.5em] flex-1 resize-none border-0 bg-transparent font-mono text-[13px] text-ow-t1 outline-none"
                      :placeholder="blockDef(b)?.ph"
                      @input="onBlockInput(b.id, $event)"
                      @focus="editor.setFoc(b.id)"
                      @keydown="onBlockKeydown($event, b)"
                    />
                  </div>
                </template>

                <textarea
                  v-else
                  :value="b.text"
                  rows="1"
                  class="min-h-[1.5em] w-full resize-none border-0 bg-transparent font-mono text-[13px] outline-none"
                  :style="textareaStyle(b)"
                  :placeholder="blockDef(b)?.ph"
                  @input="onBlockInput(b.id, $event)"
                  @focus="editor.setFoc(b.id)"
                  @keydown="onBlockKeydown($event, b)"
                />
              </div>
            </div>
          </main>

          <!-- AI -->
          <aside
            v-if="editor.aiOpen"
            v-show="!isMobile || editor.mobileTab === 'ai'"
            class="flex w-[255px] shrink-0 flex-col border-l border-white/5 bg-ow-surf md:flex"
            :class="{ hidden: isMobile && editor.mobileTab !== 'ai' }"
            :style="{ width: isMobile ? '100%' : editor.aiW + 'px', minWidth: isMobile ? '100%' : editor.aiW + 'px' }"
          >
            <div class="shrink-0 border-b border-white/10 p-3">
              <div class="mb-2 text-[9px] tracking-[2px] text-ow-t3">ИИ МОДЕЛИ</div>
              <button
                v-for="m in AIM"
                :key="m.id"
                type="button"
                class="mb-1 flex w-full items-center justify-between rounded-[10px] border-0 px-2.5 py-2 font-mono transition-all"
                :class="
                  editor.aiMod === m.id ? 'bg-ow-bg shadow-ow-in' : 'bg-transparent'
                "
                @click="editor.aiMod = m.id"
              >
                <span class="flex items-center text-[11px]">
                  <span
                    class="mr-2 h-1.5 w-1.5 rounded-full"
                    :style="{
                      background: m.color,
                      boxShadow:
                        editor.aiMod === m.id ? `0 0 8px ${m.color}` : 'none',
                      opacity: editor.aiMod === m.id ? 1 : 0.25,
                    }"
                  />
                  <span :class="editor.aiMod === m.id ? 'text-ow-t1' : 'text-ow-t2'">{{
                    m.label
                  }}</span>
                </span>
                <span
                  v-if="m.free"
                  class="text-[8px] tracking-wider text-emerald-400/40 border border-emerald-500/20 rounded px-1"
                  >FREE</span
                >
              </button>
            </div>
            <div class="flex flex-1 flex-col gap-3 overflow-y-auto p-2.5">
              <div
                v-for="(msg, i) in editor.msgs"
                :key="i"
                class="flex"
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[90%] rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-ow-sm"
                  :class="
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-ow-bg text-ow-t2'
                      : 'rounded-bl-sm border-l-2 border-ow-accent/80 bg-ow-surf text-ow-t1'
                  "
                >
                  {{ msg.text }}
                </div>
              </div>
              <div v-if="editor.aiLoad" class="flex items-center gap-2 text-[10px] text-ow-t3">
                <WhaleMark :size="20" />
                ДУМАЕТ…
              </div>
            </div>
            <div class="shrink-0 border-t border-white/10 p-2">
              <div class="flex gap-2 rounded-xl bg-ow-bg p-2 shadow-ow-in">
                <textarea
                  v-model="editor.aiIn"
                  rows="2"
                  class="min-h-[48px] flex-1 resize-none border-0 bg-transparent font-mono text-[11px] text-ow-t1 outline-none"
                  :placeholder="AIM.find((x) => x.id === editor.aiMod)?.label + '…'"
                  @keydown.enter.exact.prevent="editor.sendAi"
                />
                <button
                  type="button"
                  class="self-end rounded-lg border-0 bg-ow-surf px-2.5 py-1 font-mono text-sm text-ow-accent shadow-ow-sm"
                  @click="editor.sendAi"
                >
                  →
                </button>
              </div>
              <p class="mt-1 text-center text-[9px] tracking-wider text-ow-t3">
                {{
                  AIM.find((x) => x.id === editor.aiMod)?.free
                    ? "БЕСПЛАТНО"
                    : "≈ 12 КРЕДИТОВ"
                }}
              </p>
            </div>
          </aside>
        </div>

        <!-- Mobile tab bar -->
        <nav
          class="flex shrink-0 border-t border-white/10 bg-ow-surf md:hidden"
        >
          <button
            v-for="t in [
              { id: 'editor', l: 'Текст' },
              { id: 'scenes', l: 'Сцены' },
              { id: 'ai', l: 'ИИ' },
            ]"
            :key="t.id"
            type="button"
            class="flex-1 border-0 py-3 font-mono text-[10px] tracking-wider"
            :class="
              editor.mobileTab === t.id ? 'text-ow-accent bg-ow-bg/40' : 'text-ow-t3'
            "
            @click="editor.mobileTab = t.id as 'editor' | 'scenes' | 'ai'"
          >
            {{ t.l }}
          </button>
        </nav>
      </div>

      <!-- Menu overlay -->
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-50 flex justify-end bg-black/50"
        @click.self="menuOpen = false"
      >
        <div
          class="h-full w-[min(320px,100%)] bg-ow-surf p-4 shadow-ow-out"
          @click.stop
        >
          <div class="mb-4 font-mono text-sm tracking-wider text-ow-t1">МЕНЮ</div>
          <button
            type="button"
            class="mb-2 block w-full rounded-lg border border-white/10 bg-ow-bg py-3 text-left px-3 font-mono text-xs text-ow-t2"
            @click="
              editor.newProject();
              menuOpen = false;
            "
          >
            Новый проект
          </button>
          <button
            type="button"
            class="mb-2 block w-full rounded-lg border border-white/10 bg-ow-bg py-3 text-left px-3 font-mono text-xs text-ow-t2"
            @click="projectsOpen = true"
          >
            Мои проекты
          </button>
          <button
            type="button"
            class="mb-2 block w-full rounded-lg border border-white/10 py-3 text-left px-3 font-mono text-xs"
            :class="isGuest ? 'text-ow-t3 line-through' : 'text-ow-t2 bg-ow-bg'"
            :disabled="isGuest"
            @click="doExportTxt"
          >
            Экспорт TXT
          </button>
          <router-link
            v-if="auth.isAdmin"
            to="/admin"
            class="mb-2 block w-full rounded-lg border border-ow-accent/30 bg-ow-bg py-3 text-center font-mono text-xs text-ow-accent"
            @click="menuOpen = false"
          >
            Админка
          </router-link>
          <button
            type="button"
            class="mt-4 block w-full rounded-lg border-0 bg-ow-accent/20 py-3 font-mono text-xs text-ow-accent"
            @click="logout"
          >
            На главную
          </button>
        </div>
      </div>

      <!-- Projects -->
      <div
        v-if="projectsOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="projectsOpen = false"
      >
        <div class="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-2xl bg-ow-surf p-4 shadow-ow-out">
          <div class="mb-3 font-mono text-sm text-ow-t1">Проекты</div>
          <button
            v-for="p in projectList"
            :key="p.id"
            type="button"
            class="mb-2 w-full rounded-lg border border-white/10 bg-ow-bg py-2 text-left px-3 font-mono text-xs text-ow-t2"
            @click="loadProj(p.id)"
          >
            {{ p.name }} · {{ p.mode }}
          </button>
          <button
            type="button"
            class="mt-2 w-full border-0 text-center text-xs text-ow-t3 underline"
            @click="projectsOpen = false"
          >
            Закрыть
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { IonContent, IonPage } from "@ionic/vue";
import WhaleMark from "@/components/WhaleMark.vue";
import ModeIcon from "@/components/ModeIcon.vue";
import { AIM, MODES_META } from "@/domain/aiModels";
import type { SceneItem } from "@/domain/scenes";
import type { ScriptBlock } from "@/domain/scriptBlock";
import { useWindowWidth } from "@/composables/useWindowWidth";
import { useAuthStore } from "@/stores/auth";
import { useEditorStore } from "@/stores/editor";
import { useProfileStore } from "@/stores/profile";
import { blocksToPlainText, downloadText } from "@/services/exportPlain";
import { VALID_MODES, type EditorMode } from "@/router";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const profile = useProfileStore();
const editor = useEditorStore();
const winW = useWindowWidth();
const isMobile = computed(() => winW.value < 768);

function goMode(m: string) {
  router.replace({ name: "editor", params: { mode: m } });
}

watch(
  () => route.params.mode as string | undefined,
  (m) => {
    if (m && VALID_MODES.includes(m as EditorMode) && m !== editor.mode) {
      editor.switchMode(m);
    }
  },
  { immediate: true },
);

const menuOpen = ref(false);
const projectsOpen = ref(false);
const typeMenuId = ref<number | null>(null);
const scrollRef = ref<HTMLElement | null>(null);

const isGuest = computed(
  () => profile.profile?.mode === "note" && !auth.loggedIn,
);

const projectList = ref<{ id: string; name: string; mode: string }[]>([]);

function loadProjectIndex() {
  try {
    projectList.value = JSON.parse(localStorage.getItem("ow_index") || "[]");
  } catch {
    projectList.value = [];
  }
}

function blockDef(b: ScriptBlock) {
  return editor.defs.find((d) => d.type === b.type);
}

function textareaStyle(b: ScriptBlock) {
  const st = blockDef(b)?.st || {};
  return { ...st, fontFamily: "'Courier New', monospace" } as Record<string, string>;
}

function lineStyle(b: ScriptBlock) {
  const st = blockDef(b)?.st || {};
  return { ...st, fontFamily: "'Courier New', monospace" } as Record<string, string>;
}

function isSceneHeader(b: ScriptBlock) {
  if (b.type === "scene") return true;
  if (editor.mode === "play" && b.type === "act") return true;
  if (editor.mode === "media" && b.type === "segment") return true;
  if (editor.mode === "short" && b.type === "video") return true;
  return false;
}

function sceneTitle(s: SceneItem) {
  if (s.kind === "act") return (s.text || "АКТ").toUpperCase();
  const n = s.actNum && s.subNum ? `${s.actNum}.${s.subNum}` : String(s.num);
  return (n + " " + (s.text || "")).trim();
}

function scrollToScene(id: number) {
  editor.setFoc(id);
  const el = scrollRef.value?.querySelector(`[data-scene-id="${id}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (isMobile.value) editor.mobileTab = "editor";
}

function onBlockInput(id: number, e: Event) {
  const t = e.target as HTMLTextAreaElement;
  editor.updateBlockText(id, t.value);
  t.style.height = "auto";
  t.style.height = t.scrollHeight + "px";
}

function onNoteInput() {
  editor.touchNote();
}

function onBlockKeydown(e: KeyboardEvent, b: ScriptBlock) {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === "d") {
    e.preventDefault();
    editor.duplicateBlock(b.id);
  }
  if (mod && e.key === "Backspace") {
    e.preventDefault();
    editor.delBlock(b.id);
  }
}

function globalKey(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    editor.undo();
  }
  if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
    e.preventDefault();
    editor.redo();
  }
  if (mod && e.key === "s") {
    e.preventDefault();
    editor.flushSave();
  }
  if (e.key === "Escape") {
    menuOpen.value = false;
    projectsOpen.value = false;
    typeMenuId.value = null;
  }
}

function doExportTxt() {
  if (isGuest.value) return;
  const body =
    editor.mode === "note"
      ? editor.noteText
      : blocksToPlainText(editor.blocks, editor.mode);
  downloadText((editor.projectName || "export") + ".txt", body);
  menuOpen.value = false;
}

function loadProj(id: string) {
  editor.loadProject(id);
  projectsOpen.value = false;
  menuOpen.value = false;
}

function logout() {
  auth.logout();
  profile.clear();
  menuOpen.value = false;
  router.replace("/");
}

onMounted(() => {
  profile.loadFromStorage();
  const routeMode = route.params.mode as string | undefined;
  const m = (routeMode && VALID_MODES.includes(routeMode as EditorMode))
    ? routeMode
    : profile.profile?.mode || "film";
  editor.initFromProfile(m);
  try {
    const d = localStorage.getItem("ow_note_draft");
    if (d) {
      editor.noteText = d;
      localStorage.removeItem("ow_note_draft");
    }
  } catch {
    /* ignore */
  }
  loadProjectIndex();
  window.addEventListener("keydown", globalKey);
});

onUnmounted(() => window.removeEventListener("keydown", globalKey));
</script>
