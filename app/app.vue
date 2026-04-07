<template>
	<UApp
		:toaster="{
			expand: true,
			duration: 5000,
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
const { fetch: refreshSession } = useUserSession();
// Watch for route changes to update appName
watch(
	router.currentRoute,
	(route) => {
		switch (route.path) {
			case "/staryl": {
				appName.value = "staryl";
				break;
			}
			default: {
				appName.value = "wolfstar";
			}
		}
	},
	{ immediate: true },
);

provide(ProviderAppNameKey, appName);

onMounted(() => {
	if (import.meta.test) return;
	// In CI/test environments, we want to bypass the normal session refresh logic
	$fetch("/api/auth/refresh").then(refreshSession);
});
</script>
