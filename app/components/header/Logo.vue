<template>
  <nuxt-link class="flex items-center transition-transform hover:scale-105" :to="currentApp.landing">
    <icons-wolfstar class="h-10 w-10" />
    <h1 class="ml-2 text-2xl text-ui-100 font-bold">{{ currentApp.name }}</h1>
  </nuxt-link>
</template>

<script lang="ts" setup>
const { currentApp } = useHeader();
</script>
