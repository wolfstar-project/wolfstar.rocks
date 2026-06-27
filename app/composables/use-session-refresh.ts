export function useSessionRefresh() {
	const { fetch: refetchSession } = useUserSession();
	const documentVisibility = useDocumentVisibility();

	async function refreshAndSync(): Promise<void> {
		await $fetch("/api/auth/refresh").catch(() => {});
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
