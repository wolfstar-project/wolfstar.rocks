/**
 * Empties the browser's store of dashboard answers (`persisted-cache.ts`) when
 * the account signs out or another one signs in, so nobody is shown what the
 * last admin on this browser saw.
 */
export default defineNuxtPlugin(() => {
	const { user } = useUserSession();

	watch(
		() => user.value?.id ?? null,
		(id, previous) => {
			if (previous !== null && id !== previous) clearPersistedCache();
		},
	);
});
