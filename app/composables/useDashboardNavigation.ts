/**
 * Section and guild switches that respect staged settings changes: with edits
 * pending, the switch is parked in `pendingNavigation` for the layout's
 * "unsaved changes" dialog to confirm or cancel.
 *
 * Kept apart from `useActiveGuild()` on purpose: `useGuildSettingsChanges()`
 * depends on the active guild, so folding this in would make the two
 * composable modules import each other.
 */
export function useDashboardNavigation() {
	const { activeGuildId, pendingNavigation, section, selectGuild, setSection } = useActiveGuild();
	const { guildSettingsChanges } = useGuildSettingsChanges();

	const hasStagedChanges = computed(
		() =>
			guildSettingsChanges.value !== undefined &&
			Object.keys(guildSettingsChanges.value).length > 0,
	);

	function goToSection(slug: string) {
		if (slug === section.value) {
			return;
		}
		if (hasStagedChanges.value) {
			pendingNavigation.value = { section: slug };
			return;
		}
		setSection(slug);
	}

	function goToGuild(guildId: string | null) {
		if (guildId === activeGuildId.value) {
			return;
		}
		if (hasStagedChanges.value) {
			pendingNavigation.value = { guildId };
			return;
		}
		selectGuild(guildId);
	}

	function confirmPendingNavigation() {
		const pending = pendingNavigation.value;
		pendingNavigation.value = null;
		if (!pending) {
			return;
		}
		if (pending.guildId !== undefined) {
			selectGuild(pending.guildId);
		}
		if (pending.section !== undefined) {
			setSection(pending.section);
		}
	}

	function cancelPendingNavigation() {
		pendingNavigation.value = null;
	}

	return {
		activeGuildId,
		cancelPendingNavigation,
		confirmPendingNavigation,
		goToGuild,
		goToSection,
		hasStagedChanges,
		pendingNavigation,
		section,
	};
}
