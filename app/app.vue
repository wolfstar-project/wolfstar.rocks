<template>
	<UApp
		:locale="uiLocale"
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
		<LazyAppPreferencesDialog v-if="consoleDialogRequested" />
		<LazyAppPreferencesQuickDialog v-if="quickDialogRequested" />
	</UApp>
</template>

<script setup lang="ts">
useSessionRefresh();
useAuthIdentity();

// A dialog's chunk is only fetched once someone opens it, and it then stays
// mounted so closing it can animate out.
const { isOpen: preferencesOpen, variant: preferencesVariant } = usePreferencesDialog();
const consoleDialogRequested = ref(preferencesOpen.value && preferencesVariant.value === "console");
const quickDialogRequested = ref(preferencesOpen.value && preferencesVariant.value === "quick");
watch([preferencesOpen, preferencesVariant], ([isOpen, variant]) => {
	if (!isOpen) return;
	if (variant === "quick") quickDialogRequested.value = true;
	else consoleDialogRequested.value = true;
});

const router = useRouter();
const appName = ref<"wolfstar" | "staryl">("wolfstar");
const { locale, locales } = useAppLocale();
// Nuxt UI's own strings follow the language on screen too.
const uiLocale = computed(() => getNuxtUiLocale(locale.value));

const localeMap = computed(() =>
	Object.fromEntries(locales.value.map((entry) => [entry.code, entry.dir ?? "ltr"])),
);

// Site config's locale feeds the SEO defaults (`og:locale`, and a `<html lang>`
// of its own); it only follows @nuxtjs/i18n by itself, so it is handed ours.
updateSiteConfig({ currentLocale: locale });

// `<html lang>` and `dir` follow the active locale. They are refs, which unhead
// watches, rather than getters, which it only reads on the next render. The
// entry is `low` priority on purpose: for `<html>` attributes the entry sorted
// last wins, and nuxt-seo-utils sets its own `lang` at `low` priority, so an
// entry of normal priority lost to it and a language switch left `lang` on
// en-US. Pushed later, this one sorts after it.
const htmlDir = computed(() => localeMap.value[locale.value] ?? "ltr");
useHead({ htmlAttrs: { dir: htmlDir, lang: locale } }, { tagPriority: "low" });

useHead({
	script: [
		// Picks the header's account skeleton before the first paint (`auth-hint.ts`).
		{ innerHTML: AUTH_HINT_SCRIPT, key: "auth-hint", tagPosition: "head" },
		// Applies Discord's darker dark theme before the first paint (`theme-shade.ts`).
		{ innerHTML: THEME_SHADE_SCRIPT, key: "theme-shade", tagPosition: "head" },
	],
});
useAppliedTheme();

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
