import type { UserSettings } from "#shared/schemas";

/**
 * The signed-in user's own WolfStar settings (`/api/users/settings`), and the
 * call that changes them. A change shows at once and is undone if the server
 * refuses it; quick changes are saved in order, the newest last.
 */
export function useUserSettings() {
	const { user } = useUserSession();

	const asyncData = useLazyAsyncData(
		() => `user:${user.value?.id ?? "guest"}:settings`,
		() =>
			user.value
				? $fetch<UserSettings>("/api/users/settings")
				: Promise.resolve<UserSettings | null>(null),
		{ server: false, watch: [() => user.value?.id] },
	);

	// Saves go out one at a time and in order, so the server always stores the
	// newest choice last; a save overtaken by a newer change while it waited is
	// not sent at all. A failed newest save brings back what the server holds.
	let latestChange = 0;
	let savesInFlight = 0;
	let confirmed: UserSettings | null | undefined;
	let lastSave: Promise<unknown> = Promise.resolve();

	async function setReport(report: boolean): Promise<boolean> {
		const change = ++latestChange;
		// With nothing in flight, what is shown is what the server holds.
		if (savesInFlight === 0) confirmed = asyncData.data.value;
		savesInFlight += 1;
		asyncData.data.value = { ...asyncData.data.value, report };

		const save = lastSave.then(() =>
			change === latestChange
				? $fetch<UserSettings>("/api/users/settings", { body: { report }, method: "PATCH" })
				: null,
		);
		lastSave = save.catch(() => undefined);

		try {
			const saved = await save;
			if (saved) confirmed = saved;
			if (saved && change === latestChange) asyncData.data.value = saved;
			return true;
		} catch {
			if (change === latestChange) asyncData.data.value = confirmed;
			return false;
		} finally {
			savesInFlight -= 1;
		}
	}

	return { ...asyncData, setReport };
}
