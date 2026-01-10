<template>
  <UApp
    :toaster="{
      expand: true,
      duration: 5000
    }"
  >
    <NuxtPwaManifest />
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="bg-neutral" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
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

provide(ProviderAppNameKey, appName);

// Better auth handles session refresh automatically
// No need for manual refresh on mount
</script>
