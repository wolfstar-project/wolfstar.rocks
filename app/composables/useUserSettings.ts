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

	async function setReport(report: boolean): Promise<boolean> {
		const previous = asyncData.data.value;
		asyncData.data.value = { ...previous, report };
		try {
			asyncData.data.value = await $fetch<UserSettings>("/api/users/settings", {
				body: { report },
				method: "PATCH",
			});
			return true;
		} catch {
			asyncData.data.value = previous;
			return false;
		}
	}

	return { ...asyncData, setReport };
}
