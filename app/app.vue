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
		<LazyAppPreferencesDialog v-if="preferencesRequested" />
	</UApp>
</template>

<script setup lang="ts">
useSessionRefresh();
useAuthIdentity();

// The dialog's chunk is only fetched once someone opens it, and it then stays
// mounted so closing it can animate out.
const { isOpen: preferencesOpen } = usePreferencesDialog();
const preferencesRequested = ref(preferencesOpen.value);
watch(preferencesOpen, (isOpen) => {
	if (isOpen) preferencesRequested.value = true;
});

const router = useRouter();
const appName = ref<"wolfstar" | "staryl">("wolfstar");
const { locale, locales } = useAppLocale();

const localeMap = computed(() =>
	Object.fromEntries(locales.value.map((entry) => [entry.code, entry.dir ?? "ltr"])),
);

useHead({
	htmlAttrs: {
		lang: () => locale.value,
		dir: () => localeMap.value[locale.value] ?? "ltr",
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
