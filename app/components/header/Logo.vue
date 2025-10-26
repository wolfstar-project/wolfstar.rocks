<template>
  <nuxt-link
    class="flex items-center transition-transform hover:scale-105"
    :to="currentApp.landing"
    :aria-label="`${currentApp.name} home page`"
  >
    <icons-wolfstar class="h-10 w-10" aria-hidden="true" />
    <span class="ml-2 text-2xl text-ui-100 font-bold">{{ currentApp.name }}</span>
  </nuxt-link>
</template>

<script lang="ts" setup>
const { currentApp } = useHeader();
</script>
