export function useAuthIdentity() {
	const { user } = useUserSession();

	if (!import.meta.client) {
		return;
	}

	watch(
		user,
		(currentUser) => {
			if (currentUser) {
				setIdentity({ userId: currentUser.id, userName: currentUser.name });
			} else {
				clearIdentity();
			}
		},
		{ immediate: true },
	);
}
