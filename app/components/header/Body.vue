<!-- eslint-disable vue/no-template-shadow -->
<template>
  <UNavigationMenu orientation="vertical" :items="mobileLinks" class="-mx-2.5" />
</template>

<script setup lang="ts">
const { mobileLinks } = useHeader();
</script>
