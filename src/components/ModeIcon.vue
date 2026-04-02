<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0"
  >
    <template v-if="id === 'film'">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="17" y1="7" x2="22" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
    </template>
    <template v-else-if="id === 'play'">
      <path d="M2 6h20M2 12h12M2 18h8" />
      <circle cx="19" cy="17" r="3" />
      <path d="M19 14v-2" />
    </template>
    <template v-else-if="id === 'short'">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </template>
    <template v-else-if="id === 'media'">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3h-8M12 3v4" />
      <circle cx="12" cy="14" r="2" />
      <path d="M8 14h.01M16 14h.01" />
    </template>
    <template v-else>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ id: string }>();
</script>
