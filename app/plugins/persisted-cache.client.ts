/**
 * Empties the browser's store of dashboard answers (`persisted-cache.ts`) when
 * the account signs out or another one signs in, so nobody is shown what the
 * last admin on this browser saw.
 */
export default defineNuxtPlugin(() => {
	const { user } = useUserSession();

	// From the first value on: a sign-in lands on a fresh page load, where the
	// account is already the new one and no change of it is ever seen. The
	// session reads as `null` until it is known, which clears nothing then.
	watch(
		() => user.value?.id ?? null,
		(id, previous) => {
			if (id !== null) clearPersistedCacheExcept(id);
			else if (previous !== null && previous !== undefined) clearPersistedCache();
		},
		{ immediate: true },
	);
});
