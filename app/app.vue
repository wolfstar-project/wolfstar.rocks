<template>
  <nuxt-pwa-manifest />
  <nuxt-loading-indicator color="bg-neutral" />

  <nuxt-layout name="main">
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup lang="ts">
const router = useRouter();
const appName = ref<"wolfstar" | "staryl">("wolfstar");

// Watch for route changes to update appName
watch(
  router.currentRoute,
  (route) => {
    switch (route.path) {
      case "/staryl":
        appName.value = "staryl";
        break;
      default:
        appName.value = "wolfstar";
    }
  },
  { immediate: true },
);

useSeoMetadata({
  ogSiteName: "WolfStar",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "wolfstar_bot",
});

provide(ProviderAppNameKey, appName);
</script>
