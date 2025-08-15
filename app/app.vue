<template>
  <vite-pwa-manifest />
  <nuxt-loading-indicator color="bg-neutral" />
  <nuxt-layout name="main">
    <nuxt-page />
    <ShadToaster position="bottom-left" />
  </nuxt-layout>
</template>

<script setup lang="ts">
const router = useRouter();
const appName = ref<"wolfstar" | "staryl">("wolfstar");

const nuxtApp = useNuxtApp();
nuxtApp.hooks.hookOnce("app:manifest:update", () => {
  useToast().add({
    title: "Needs to update",
    color: "info",
    description: "Update the app to the latest version",
    closeIcon: "ic:round-close",
    actions: [{
      color: "neutral",
      activeColor: "primary",
      label: "Update",
      onClick: (_event) => window.location.reload(),
      icon: "ic:round-warning",
    }],
  });
});
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
