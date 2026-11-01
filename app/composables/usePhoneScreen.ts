/** Below this width the dashboard shows one screen at a time (Tailwind's `sm`). */
export const PHONE_MEDIA_QUERY = "(max-width: 639.98px)";

export type PhoneScreen = "list" | "page";

/**
 * Which of the phone's two screens of `/app` is open: the list of servers and
 * sections, or the page of the open section. It lives in the URL
 * (`?screen=page`), so the browser's back gesture returns to the list and a
 * reload lands on the same screen; the server and the section stay in
 * `useActiveGuild()`.
 */
export function usePhoneScreen() {
	const router = useRouter();
	// The router's own route: `useRoute()` follows the page and lags a change of
	// the query that no page reacts to.
	const route = computed(() => router.currentRoute.value);
	const isPhone = useMediaQuery(PHONE_MEDIA_QUERY);

	const screen = computed<PhoneScreen>(() =>
		route.value.query.screen === "page" ? "page" : "list",
	);

	/** Opens the page of the section, in a new history entry. */
	async function openPage() {
		if (screen.value === "page") return;
		await router.push({ query: { ...route.value.query, screen: "page" } });
	}

	/** Returns to the list: back in history when the list is the entry before, else in place. */
	async function openList() {
		if (screen.value === "list") return;
		const list = router.resolve({
			query: { ...route.value.query, screen: undefined },
		}).fullPath;
		const back: unknown = import.meta.client ? window.history.state?.back : undefined;
		if (back === list) {
			router.back();
			await new Promise<void>((resolve) => {
				const stop = router.afterEach(() => {
					stop();
					resolve();
				});
			});
			return;
		}
		await router.replace(list);
	}

	return { isPhone, openList, openPage, screen };
}
