export function useSessionRefresh() {
	const { fetchSession: refetchSession } = useUserSession();
	const documentVisibility = useDocumentVisibility();

	async function refreshAndSync(): Promise<void> {
		// Auth runs on the external bot Better Auth server (clientOnly mode).
		// Refresh the local session cache from that backend — there is no
		// Nuxt `/api/auth/refresh` route anymore.
		await refetchSession();
	}

	onMounted(() => {
		if (import.meta.test) return;
		void refreshAndSync();
	});

	if (import.meta.client) {
		watch(documentVisibility, (visibility) => {
			if (visibility !== "visible" || import.meta.test) return;
			void refreshAndSync();
		});
	}
}
