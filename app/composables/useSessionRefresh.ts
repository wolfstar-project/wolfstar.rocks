export function useSessionRefresh() {
	const { fetchSession: refetchSession } = useUserSession();
	const documentVisibility = useDocumentVisibility();

	async function refreshAndSync(): Promise<void> {
		await $fetch("/api/auth/refresh").catch(() => {});
		await refetchSession();
	}

	onMounted(() => {
		if (process.env.TEST) return;
		void refreshAndSync();
	});

	if (import.meta.client) {
		watch(documentVisibility, (visibility) => {
			if (visibility !== "visible" || process.env.TEST) return;
			void refreshAndSync();
		});
	}
}
