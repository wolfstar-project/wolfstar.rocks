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
			<NuxtPage
				:transition="{
					name: 'page',
					mode: 'out-in',
				}"
			/>
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
import { isCI, isTest } from "std-env";

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
	if (!isCI || !isTest) return;
	// In CI/test environments, we want to bypass the normal session refresh logic
	$fetch("/api/auth/refresh").then(refreshSession);
});
</script>
