/**
 * Composable for accessing translation status data from Lunaria.
 * Provides information about translation progress for each locale.
 */
export function useI18nStatus() {
	const { locale: currentLocale } = useI18n();

	const {
		data: status,
		status: fetchStatus,
		error,
	} = useFetch<I18nStatus>("/lunaria/status.json", {
		responseType: "json",
		server: false,
		// Cache the result to avoid refetching on navigation
		getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
	});

	const localesMap = computed<Map<string, I18nLocaleStatus> | undefined>(() => {
		return status.value?.locales.reduce((acc, locale) => {
			acc.set(locale.lang, locale);
			return acc;
		}, new Map());
	});

	function getLocaleStatus(langCode: string): I18nLocaleStatus | null {
		return localesMap.value?.get(langCode) ?? null;
	}

	const currentLocaleStatus = computed<I18nLocaleStatus | null>(() =>
		getLocaleStatus(currentLocale.value),
	);

	const isComplete = computed(() => {
		const localeStatus = currentLocaleStatus.value;
		if (!localeStatus) return true;
		return localeStatus.percentComplete === 100;
	});

	const isSourceLocale = computed(() => {
		const sourceLang = status.value?.sourceLocale.lang ?? "en";
		return currentLocale.value === sourceLang || currentLocale.value.startsWith(`${sourceLang}-`);
	});

	const githubEditUrl = computed(() => {
		return currentLocaleStatus.value?.githubEditUrl ?? null;
	});

	return {
		status,
		fetchStatus,
		error,
		getLocaleStatus,
		currentLocaleStatus,
		isComplete,
		isSourceLocale,
		githubEditUrl,
		localesMap,
	};
}
