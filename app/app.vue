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
useSessionRefresh();
useAuthIdentity();

const router = useRouter();
const appName = ref<"wolfstar" | "staryl">("wolfstar");
const { locale, locales } = useI18n();

const localeMap = Object.fromEntries(
	locales.value.map((entry) => [entry.code, entry.dir ?? "ltr"]),
);

useHead({
	htmlAttrs: {
		lang: () => locale.value,
		dir: () => localeMap[locale.value] ?? "ltr",
	},
});

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
</script>
