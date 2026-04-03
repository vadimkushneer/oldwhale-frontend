<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ow-content">
      <div
        ref="containerRef"
        class="relative flex min-h-screen select-none flex-col items-center justify-center overflow-hidden font-mono touch-none"
        style="touch-action: none"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <div class="absolute left-1/2 top-7 flex -translate-x-1/2 items-center">
          <div
            class="mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-ow-surf shadow-ow-sm text-ow-t1"
          >
            <WhaleMark :size="18" />
          </div>
          <span class="text-xs tracking-[6px] text-ow-t1">OLD WHALE</span>
        </div>

        <div
          class="relative box-border flex h-[380px] w-full max-w-[600px] items-center px-8"
          @wheel.prevent="onWheel"
        >
          <div class="relative h-full w-[160px] shrink-0 cursor-grab">
            <svg
              width="160"
              height="380"
              class="pointer-events-none absolute left-0 top-0 overflow-visible"
            >
              <defs>
                <linearGradient id="arcFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" :stop-color="T3" stop-opacity="0" />
                  <stop offset="30%" :stop-color="T3" stop-opacity="0.5" />
                  <stop offset="50%" :stop-color="T3" stop-opacity="0.7" />
                  <stop offset="70%" :stop-color="T3" stop-opacity="0.5" />
                  <stop offset="100%" :stop-color="T3" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path :d="arcPath" stroke="url(#arcFade)" stroke-width="1" fill="none" />
              <circle
                v-for="(p, i) in pts"
                :key="'c' + i"
                :cx="p.x"
                :cy="p.y"
                :r="i === active ? 4 : 2.5"
                :fill="i === active ? item.color : T3"
                :opacity="dotOpacity(i)"
                style="transition: all 0.35s"
              />
            </svg>
            <button
              v-for="(w, i) in WHEEL_ITEMS"
              :key="w.id"
              type="button"
              class="absolute cursor-pointer border-0 bg-transparent font-mono leading-none transition-all duration-300"
              :style="numStyle(i, w)"
              @click="active = i"
            >
              {{ w.num }}
            </button>
          </div>

          <div class="flex flex-1 flex-col pl-9">
            <h1 class="text-[32px] font-light leading-tight tracking-wide text-ow-t1 transition-all duration-300">
              {{ item.label }}
            </h1>
            <p class="mt-1 max-w-[220px] text-[13px] leading-relaxed text-ow-t2 transition-all duration-300">
              {{ item.desc }}
            </p>
            <button
              type="button"
              class="mt-3 w-fit rounded-xl border-0 px-[22px] py-[11px] font-mono text-[11px] tracking-[3px] shadow-ow-out transition-shadow"
              :style="{ color: item.color, background: SURF }"
              @click="start"
            >
              НАЧАТЬ →
            </button>
          </div>
        </div>

        <div class="absolute bottom-7 flex items-center text-[10px] tracking-[2px] text-ow-t3">
          <span class="mr-1 text-base">↕</span> КРУТИ ДЛЯ ВЫБОРА
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { IonContent, IonPage } from "@ionic/vue";
import WhaleMark from "@/components/WhaleMark.vue";
import { WHEEL_ITEMS } from "@/domain/aiModels";
import { useProfileStore } from "@/stores/profile";

const SURF = "#1f2040";
const T3 = "#5a587a";

const router = useRouter();
const profile = useProfileStore();

const active = ref(0);
const containerRef = ref<HTMLElement | null>(null);
const dragRef = ref<{ y: number; lastActive: number } | null>(null);
const lastWheel = ref(0);
const wheelAcc = ref(0);

const N = WHEEL_ITEMS.length;
const ITEM_H = 76;
const R = 180;
const CX = -R + 55;
const STEP_DEG = 18;

const item = computed(() => WHEEL_ITEMS[active.value]);

const pts = computed(() => {
  const H = N * ITEM_H;
  const CY = H / 2;
  return WHEEL_ITEMS.map((_, i) => {
    const deg = (i - active.value) * STEP_DEG;
    const rad = (deg * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad), deg };
  });
});

const arcPath = computed(() =>
  pts.value
    .map((p, i) =>
      i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `A ${R} ${R} 0 0 1 ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
    )
    .join(" "),
);

function clamp(v: number) {
  return Math.max(0, Math.min(N - 1, v));
}

function dotOpacity(i: number) {
  const dist = Math.abs(i - active.value);
  return i === active.value ? 1 : Math.max(0, 0.6 - dist * 0.15);
}

function numStyle(i: number, w: (typeof WHEEL_ITEMS)[0]) {
  const p = pts.value[i];
  const dist = Math.abs(i - active.value);
  const scale = i === active.value ? 1 : Math.max(0.4, 1 - dist * 0.2);
  const opacity = i === active.value ? 1 : Math.max(0.12, 0.55 - dist * 0.15);
  return {
    top: `${p.y}px`,
    left: `${Math.max(p.x + 10, 8)}px`,
    transform: `translateY(-50%) scale(${scale})`,
    transformOrigin: "left center",
    fontSize: i === active.value ? "44px" : "24px",
    fontWeight: "300",
    color: i === active.value ? w.color : T3,
    opacity,
    letterSpacing: "2px",
  };
}

function onWheel(e: WheelEvent) {
  wheelAcc.value += e.deltaY;
  const now = Date.now();
  if (now - lastWheel.value < 180) return;
  lastWheel.value = now;
  const step = wheelAcc.value > 0 ? 1 : -1;
  wheelAcc.value = 0;
  active.value = clamp(active.value + step);
}

function isInteractiveTarget(target: EventTarget | null) {
  return (target as HTMLElement | null)?.closest?.(
    "button,a,input,textarea,select,label,[role='button']",
  );
}

function onPointerDown(e: PointerEvent) {
  // setPointerCapture on the parent steals the pointer from buttons — clicks never fire.
  if (isInteractiveTarget(e.target)) return;
  dragRef.value = { y: e.clientY, lastActive: active.value };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragRef.value) return;
  e.preventDefault();
  const dy = e.clientY - dragRef.value.y;
  const steps = Math.round(-dy / 64);
  active.value = clamp(dragRef.value.lastActive + steps);
}

function onPointerUp() {
  dragRef.value = null;
}

function onTouchStart(e: TouchEvent) {
  if (isInteractiveTarget(e.target)) return;
  dragRef.value = { y: e.touches[0].clientY, lastActive: active.value };
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  if (!dragRef.value) return;
  const dy = e.touches[0].clientY - dragRef.value.y;
  const steps = Math.round(-dy / 64);
  active.value = clamp(dragRef.value.lastActive + steps);
}

function onTouchEnd() {
  dragRef.value = null;
}

function start() {
  const p = WHEEL_ITEMS[active.value];
  profile.setProfile({
    id: p.id,
    label: p.label,
    mode: p.mode,
    color: p.color,
  });
  if (p.mode === "note") {
    router.replace(`/editor/${p.mode}`);
  } else {
    router.replace({ path: "/login", query: { mode: p.mode } });
  }
}

onMounted(() => {
  document.addEventListener("touchstart", onTouchStart, { passive: false });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd);
});

onUnmounted(() => {
  document.removeEventListener("touchstart", onTouchStart);
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
});
</script>
