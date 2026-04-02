<template>
  <ion-page>
    <ion-content class="bg-ow-bg">
      <div
        class="box-border flex min-h-full items-center justify-center p-6 font-mono"
      >
        <div class="w-full max-w-[360px]">
          <div class="mb-10 text-center">
            <div
              class="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-ow-surf shadow-ow-out text-ow-t1"
            >
              <WhaleMark :size="52" />
            </div>
            <div class="mb-1 text-xl tracking-[7px] text-ow-t1">OLD WHALE</div>
            <div class="text-[10px] tracking-[4px] text-ow-t3">РЕДАКТОР ИСТОРИЙ</div>
          </div>

          <div
            class="rounded-3xl p-9 shadow-[10px_10px_28px_rgba(0,0,0,0.65),-5px_-5px_14px_rgba(255,255,255,0.032)]"
            style="background: #1f2040"
          >
            <div class="mb-7 flex rounded-xl bg-ow-bg p-1 shadow-ow-in">
              <button
                type="button"
                class="flex-1 rounded-[10px] border-0 py-2.5 font-mono text-[11px] tracking-[2px] transition-all"
                :class="
                  tab === 'in'
                    ? 'text-ow-t1 shadow-ow-in'
                    : 'bg-transparent text-ow-t3'
                "
                @click="tab = 'in'"
              >
                ВОЙТИ
              </button>
              <button
                type="button"
                class="flex-1 rounded-[10px] border-0 py-2.5 font-mono text-[11px] tracking-[2px] transition-all"
                :class="
                  tab === 'reg'
                    ? 'text-ow-t1 shadow-ow-in'
                    : 'bg-transparent text-ow-t3'
                "
                @click="tab = 'reg'"
              >
                РЕГИСТРАЦИЯ
              </button>
            </div>

            <div class="flex flex-col gap-2">
              <div class="relative">
                <span
                  class="pointer-events-none absolute left-4 top-3.5 text-[13px] text-ow-t3"
                  >◉</span
                >
                <input
                  v-model="login"
                  class="box-border w-full rounded-xl border-0 bg-ow-bg py-3.5 pl-[52px] pr-4 text-base tracking-wide text-ow-t1 shadow-ow-in outline-none placeholder:text-ow-t3/50"
                  placeholder="логин"
                  @keydown.enter="submit"
                />
              </div>
              <div v-if="tab === 'reg'" class="relative">
                <span
                  class="pointer-events-none absolute left-4 top-3.5 text-[13px] text-ow-t3"
                  >✉</span
                >
                <input
                  v-model="email"
                  type="email"
                  class="box-border w-full rounded-xl border-0 bg-ow-bg py-3.5 pl-[52px] pr-4 text-base tracking-wide text-ow-t1 shadow-ow-in outline-none placeholder:text-ow-t3/50"
                  placeholder="email"
                />
              </div>
              <div class="relative">
                <span
                  class="pointer-events-none absolute left-4 top-3.5 text-[13px] text-ow-t3"
                  >◈</span
                >
                <input
                  v-model="pass"
                  type="password"
                  class="box-border w-full rounded-xl border-0 bg-ow-bg py-3.5 pl-[52px] pr-4 text-base tracking-wide text-ow-t1 shadow-ow-in outline-none placeholder:text-ow-t3/50"
                  placeholder="пароль"
                  @keydown.enter="submit"
                />
              </div>
            </div>

            <p v-if="auth.error" class="mt-3 text-center text-xs text-red-400/90">
              {{ auth.error }}
            </p>

            <button
              type="button"
              class="mt-6 flex w-full items-center justify-center rounded-[14px] border-0 py-3.5 font-mono text-xs tracking-[3px] transition-all"
              :class="
                loading
                  ? 'cursor-default bg-ow-bg text-ow-t3 shadow-ow-in'
                  : 'cursor-pointer bg-ow-accent text-white shadow-[0_4px_20px_rgba(124,106,247,0.35),4px_4px_12px_rgba(0,0,0,0.4)]'
              "
              :disabled="loading"
              @click="submit"
            >
              <template v-if="loading">
                <WhaleMark :size="18" class="mr-2 text-ow-t2" />
                ВХОДИМ...
              </template>
              <template v-else>{{ tab === "in" ? "ВОЙТИ" : "СОЗДАТЬ АККАУНТ" }}</template>
            </button>
          </div>

          <p class="mt-8 text-center text-[10px] tracking-[2px] text-ow-t3">
            ПИШИТЕ ИСТОРИИ. НЕ ОБЪЯСНЕНИЯ.
          </p>
          <button
            type="button"
            class="mt-4 w-full border-0 bg-transparent text-center text-[11px] text-ow-t3 underline"
            @click="router.push('/')"
          >
            ← к выбору режима
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { IonContent, IonPage } from "@ionic/vue";
import WhaleMark from "@/components/WhaleMark.vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const tab = ref<"in" | "reg">("in");
const login = ref("");
const email = ref("");
const pass = ref("");
const loading = ref(false);

async function submit() {
  if (!login.value || !pass.value) return;
  if (tab.value === "reg" && !email.value.includes("@")) {
    auth.setError("Укажите email");
    return;
  }
  loading.value = true;
  auth.clearError();
  try {
    if (tab.value === "in") {
      await auth.login(login.value, pass.value);
    } else {
      await auth.register(login.value, email.value, pass.value);
    }
    const redir = route.query.redirect as string | undefined;
    router.replace(redir || "/editor");
  } catch {
    /* error in store */
  } finally {
    loading.value = false;
  }
}
</script>
