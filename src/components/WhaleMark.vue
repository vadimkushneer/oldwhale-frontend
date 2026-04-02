<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="shrink-0"
    aria-hidden="true"
  >
    <ellipse cx="24" cy="26" rx="18" ry="12" fill="currentColor" opacity="0.9" />
    <path
      d="M8 26c-2-8 6-14 14-14 4 0 8 2 10 5-4-6-2-12 4-14-6 2-8 8-6 14-2-3-6-5-10-5-6 0-10 4-12 10z"
      fill="currentColor"
      opacity="0.85"
    />
    <circle cx="30" cy="24" r="2" fill="#1a1b2e" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 36 });
</script>
