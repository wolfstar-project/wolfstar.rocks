<template>
  <UApp
    :toaster="{
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
const { fetch: refreshSession } = useUserSession();
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

onMounted(() => {
  $fetch("/api/auth/refresh").then(refreshSession);
});
</script>
