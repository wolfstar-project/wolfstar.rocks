<template>
  <UApp
    :toaster="{
      position: 'top-right',
      expand: true,
      duration: 5000
    }"
  >
    <NuxtPwaManifest />
    <NuxtLoadingIndicator color="bg-neutral" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const router = useRouter();
const appName = ref<"wolfstar" | "staryl">("wolfstar");

defineOgImage({ component: "default", emojis: "twemoji" });

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
