/**
 * The visitor's cookie choice, as `nuxt-cookie-control` keeps it.
 *
 * The module's state is the source of truth: its plugin reads the choice from its
 * cookies, and the `<CookieControl>` that `ConsentManager` mounts out of sight
 * writes them back whenever `isConsentGiven` or `cookiesEnabled` change. This
 * composable only gives the app's banner and dialog a smaller surface on it.
 */
export function useCookieConsent() {
	const { cookiesEnabled, cookiesEnabledIds, isConsentGiven, isModalActive, moduleOptions } =
		useCookieControl();

	const necessaryCookies = moduleOptions.cookies.necessary;
	const optionalCookies = moduleOptions.cookies.optional;

	/** True once the visitor chose, until the configured cookie groups change. */
	const hasChosen = computed(() => isConsentGiven.value === true);

	const isSettingsOpen = computed({
		get: () => isModalActive.value === true,
		set: (open: boolean) => {
			isModalActive.value = open;
		},
	});

	function isEnabled(id: string): boolean {
		return cookiesEnabledIds.value?.includes(id) ?? false;
	}

	/** Records a choice: every necessary group plus the optional ones listed. */
	function choose(optionalIds: readonly string[]) {
		const enabled = [
			...necessaryCookies,
			...optionalCookies.filter((cookie) => optionalIds.includes(cookie.id)),
		];
		// Consent first: the module only writes the enabled ids once consent is given.
		isConsentGiven.value = true;
		cookiesEnabled.value = enabled;
		cookiesEnabledIds.value = enabled.map((cookie) => cookie.id);
	}

	return {
		hasChosen,
		isSettingsOpen,
		necessaryCookies,
		optionalCookies,
		isEnabled,
		choose,
		acceptAll: () => choose(optionalCookies.map((cookie) => cookie.id)),
		acceptNecessary: () => choose([]),
	};
}
