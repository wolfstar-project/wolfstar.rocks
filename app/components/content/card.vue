<template>
  <div
    class="mb-4 flex rounded-lg bg-opacity-25 p-4 text-sm"
    :class="{
      'bg-blue-500': type === 'info',
      'bg-yellow-500': type === 'warning',
      'bg-red-500': type === 'danger',
      'bg-green-500': type === 'success'
    }"
    role="alert"
  >
    <svg
      class="mr-3 inline h-5 w-5 flex-shrink-0 dark:text-zinc-50"
      :class="{
        'text-blue-600': type === 'info',
        'text-yellow-600': type === 'warning',
        'text-red-600': type === 'danger',
        'text-green-600': type === 'success'
      }"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clip-rule="evenodd"
      />
    </svg>
    <div class="not-prose">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: "info" | "warning" | "danger" | "success";
}>();
</script>
