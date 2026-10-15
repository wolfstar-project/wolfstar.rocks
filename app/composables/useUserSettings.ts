import type { UserSettings } from "#shared/schemas";

/**
 * The signed-in user's own WolfStar settings (`/api/users/settings`), and the
 * call that changes them. A change shows at once and is undone if the server
 * refuses it.
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

	// Only the newest change decides what is shown: an older request that
	// settles later neither overwrites it nor rolls it back.
	let latestChange = 0;

	async function setReport(report: boolean): Promise<boolean> {
		const change = ++latestChange;
		const previous = asyncData.data.value;
		asyncData.data.value = { ...previous, report };
		try {
			const saved = await $fetch<UserSettings>("/api/users/settings", {
				body: { report },
				method: "PATCH",
			});
			if (change === latestChange) asyncData.data.value = saved;
			return true;
		} catch {
			if (change === latestChange) asyncData.data.value = previous;
			return false;
		}
	}

	return { ...asyncData, setReport };
}
