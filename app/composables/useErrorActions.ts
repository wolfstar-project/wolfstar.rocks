/**
 * Error-page navigation helpers. Kept as a composable so Vitest browser-mode
 * specs can `mockNuxtImport("useErrorActions", …)` — direct `#app` imports of
 * `clearError` / `reloadNuxtApp` are not reliably mockable there.
 */
export function useErrorActions() {
	async function goHome() {
		await clearError({ redirect: "/" });
	}

	async function retry() {
		await reloadNuxtApp();
	}

	return { goHome, retry };
}
