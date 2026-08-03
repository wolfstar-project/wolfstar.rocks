export function useErrorActions() {
	async function goHome() {
		await clearError({ redirect: "/" });
	}

	async function retry() {
		await reloadNuxtApp();
	}

	return { goHome, retry };
}
