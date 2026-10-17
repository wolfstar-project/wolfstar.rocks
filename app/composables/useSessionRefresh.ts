export function useSessionRefresh() {
	const { fetchSession: refetchSession } = useUserSession();
	const documentVisibility = useDocumentVisibility();

	async function refreshAndSync(): Promise<void> {
		// Only someone this browser remembers as signed in has Discord tokens to
		// renew; for every other visitor the refresh is a server round trip that
		// can only answer "nobody", so they go straight to asking who they are.
		if (hasAuthHint()) await $fetch("/api/auth/refresh").catch(() => {});
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
