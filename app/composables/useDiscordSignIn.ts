/**
 * Better Auth's Discord sign-in action. It sits behind an app composable because
 * `useSignIn` comes from the module's barrel, which the app has loaded before a
 * spec can replace it; a page that signs in through this one can be tested with
 * `mockNuxtImport()`.
 */
export function useDiscordSignIn() {
	return useSignIn("social");
}
