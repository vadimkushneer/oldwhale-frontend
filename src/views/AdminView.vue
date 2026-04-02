<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="bg-ow-bg text-ow-t1">
        <ion-buttons slot="start">
          <ion-back-button default-href="/editor" text="Редактор" />
        </ion-buttons>
        <ion-title>Администрирование</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg-ow-bg">
      <div class="ow-desktop-frame box-border p-4 text-ow-t1">
        <section
          class="mb-8 rounded-2xl border border-white/10 bg-ow-surf/80 p-4 shadow-ow-sm"
        >
          <h2 class="mb-3 text-sm tracking-wider text-ow-t2">Новый аккаунт (тест)</h2>
          <div class="grid gap-3 md:grid-cols-2">
            <input
              v-model="form.login"
              placeholder="логин"
              class="rounded-lg border border-white/10 bg-ow-bg px-3 py-2 text-sm text-ow-t1 outline-none"
            />
            <input
              v-model="form.email"
              type="email"
              placeholder="email"
              class="rounded-lg border border-white/10 bg-ow-bg px-3 py-2 text-sm text-ow-t1 outline-none"
            />
            <input
              v-model="form.password"
              type="password"
              placeholder="пароль (от 4 символов)"
              class="rounded-lg border border-white/10 bg-ow-bg px-3 py-2 text-sm text-ow-t1 outline-none"
            />
            <select
              v-model="form.role"
              class="rounded-lg border border-white/10 bg-ow-bg px-3 py-2 text-sm text-ow-t1"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <ion-button class="mt-3" size="small" @click="createUser">Создать</ion-button>
          <p v-if="msg" class="mt-2 text-xs text-ow-accent">{{ msg }}</p>
          <p v-if="err" class="mt-2 text-xs text-red-400">{{ err }}</p>
        </section>

        <section>
          <h2 class="mb-3 text-sm tracking-wider text-ow-t2">Пользователи</h2>
          <div class="overflow-x-auto rounded-xl border border-white/10">
            <table class="w-full min-w-[640px] text-left text-sm">
              <thead class="bg-ow-surf text-ow-t3">
                <tr>
                  <th class="p-3">ID</th>
                  <th class="p-3">Логин</th>
                  <th class="p-3">Email</th>
                  <th class="p-3">Роль</th>
                  <th class="p-3">Статус</th>
                  <th class="p-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="u in users"
                  :key="u.id"
                  class="border-t border-white/5 bg-ow-bg/40"
                >
                  <td class="p-3 font-mono text-xs">{{ u.id }}</td>
                  <td class="p-3">{{ u.login }}</td>
                  <td class="p-3 text-ow-t2">{{ u.email }}</td>
                  <td class="p-3">
                    <select
                      class="rounded bg-ow-surf px-2 py-1 text-xs"
                      :value="u.role"
                      @change="patchRole(u.id, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td class="p-3">
                    <button
                      type="button"
                      class="text-xs underline text-ow-t2"
                      @click="toggleDis(u)"
                    >
                      {{ u.disabled ? "включить" : "отключить" }}
                    </button>
                  </td>
                  <td class="p-3">
                    <button
                      type="button"
                      class="text-xs text-red-400/80 underline"
                      @click="remove(u.id)"
                    >
                      удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { api, type User } from "@/api/client";

const users = ref<User[]>([]);
const msg = ref("");
const err = ref("");
const form = reactive({
  login: "",
  email: "",
  password: "",
  role: "user",
});

async function load() {
  err.value = "";
  const r = await api.adminUsers();
  users.value = r.users;
}

async function createUser() {
  msg.value = "";
  err.value = "";
  try {
    await api.adminCreateUser({
      login: form.login,
      email: form.email,
      password: form.password,
      role: form.role,
    });
    msg.value = "Создан.";
    form.login = "";
    form.email = "";
    form.password = "";
    form.role = "user";
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Ошибка";
  }
}

async function patchRole(id: number, role: string) {
  try {
    await api.adminPatchUser(id, { role });
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Ошибка";
  }
}

async function toggleDis(u: User) {
  try {
    await api.adminPatchUser(u.id, { disabled: !u.disabled });
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Ошибка";
  }
}

async function remove(id: number) {
  if (!confirm("Удалить пользователя " + id + "?")) return;
  try {
    await api.adminDeleteUser(id);
    await load();
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Ошибка";
  }
}

onMounted(() => {
  void load();
});
</script>
