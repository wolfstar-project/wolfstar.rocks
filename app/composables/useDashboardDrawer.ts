/** Whether the phone drawer (servers and sections) is open. */
export function useDashboardDrawer() {
	const open = useState("app:dashboard-drawer", () => false);

	return {
		close: () => {
			open.value = false;
		},
		open,
		toggle: () => {
			open.value = !open.value;
		},
	};
}
