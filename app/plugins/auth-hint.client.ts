/**
 * Keeps the header's auth hint (`utils/auth-hint.ts`) in step with the session,
 * so the next page load draws the right skeleton: the name once someone is
 * signed in, nothing once they sign out.
 */
export default defineNuxtPlugin(() => {
	const { ready, user } = useUserSession();

	watch(
		() => (ready.value ? (user.value?.name ?? null) : undefined),
		(name) => {
			if (name !== undefined) writeAuthHint(name);
		},
		{ immediate: true },
	);
});
