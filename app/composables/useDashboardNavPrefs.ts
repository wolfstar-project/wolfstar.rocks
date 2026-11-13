export const DASHBOARD_NAV_STORAGE_KEY = "wolfstar-dashboard-nav";

const MAX_RECENT = 3;

interface DashboardNavPrefs {
	/** Sections the admin pinned to the top of the sidebar. */
	pinned: string[];
	/** The sections opened last, most recent first. */
	recent: string[];
	/** Sidebar groups the admin folded away. */
	closedGroups: string[];
}

/**
 * Browser-local sidebar preferences: pinned sections, the sections opened last
 * and which groups are folded. Nothing here is guild data, so it never leaves
 * the browser and is shared between servers.
 */
export function useDashboardNavPrefs() {
	const prefs = useLocalStorage<DashboardNavPrefs>(
		DASHBOARD_NAV_STORAGE_KEY,
		{ closedGroups: [], pinned: [], recent: [] },
		{ mergeDefaults: true },
	);

	const pinned = computed(() => prefs.value.pinned);
	const recent = computed(() => prefs.value.recent);

	function isPinned(slug: string) {
		return prefs.value.pinned.includes(slug);
	}

	function togglePin(slug: string) {
		const current = prefs.value.pinned;
		prefs.value = {
			...prefs.value,
			pinned: current.includes(slug)
				? current.filter((entry) => entry !== slug)
				: [...current, slug],
		};
	}

	function recordVisit(slug: string) {
		if (slug === "" || prefs.value.recent[0] === slug) {
			return;
		}
		prefs.value = {
			...prefs.value,
			recent: [slug, ...prefs.value.recent.filter((entry) => entry !== slug)].slice(
				0,
				MAX_RECENT + 1,
			),
		};
	}

	function isGroupOpen(group: string) {
		return !prefs.value.closedGroups.includes(group);
	}

	function toggleGroup(group: string) {
		const closed = prefs.value.closedGroups;
		prefs.value = {
			...prefs.value,
			closedGroups: closed.includes(group)
				? closed.filter((entry) => entry !== group)
				: [...closed, group],
		};
	}

	return { isGroupOpen, isPinned, pinned, recent, recordVisit, toggleGroup, togglePin };
}
