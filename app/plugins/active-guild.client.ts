import {
	ACTIVE_GUILD_STORAGE_KEY,
	DEFAULT_DASHBOARD_SECTION,
	isValidGuildId,
	useActiveGuild,
} from "~/composables/useActiveGuild";
import { findDashboardNavItem } from "~/utils/dashboard-nav";
import { resolveLegacyDashboardSection } from "~/utils/guild-dashboard";

/**
 * Mirrors the active guild and section to localStorage so `/app` reopens where
 * the admin left off. `/app` renders client-only, so restoring synchronously
 * here cannot cause a hydration mismatch.
 */
export default defineNuxtPlugin(() => {
	const { activeGuildId, logsTab, section } = useActiveGuild();

	try {
		const raw = localStorage.getItem(ACTIVE_GUILD_STORAGE_KEY);
		if (raw) {
			const parsed: unknown = JSON.parse(raw);
			if (parsed && typeof parsed === "object") {
				const stored = parsed as Record<string, unknown>;
				if (isValidGuildId(stored.guildId)) {
					activeGuildId.value = stored.guildId;
				}
				if (typeof stored.section === "string") {
					// A section saved before V7 (`events`, `moderation/word`) or one
					// that no longer exists would otherwise render Home under a slug
					// the page does not treat as Home.
					const slug = resolveLegacyDashboardSection(stored.section);
					section.value = findDashboardNavItem(slug) ? slug : DEFAULT_DASHBOARD_SECTION;
				}
				if (typeof stored.logsTab === "string") {
					logsTab.value = stored.logsTab;
				}
			}
		}
	} catch {
		// Storage may be blocked or hold garbage; start from a clean slate.
	}

	watch([activeGuildId, section, logsTab], ([guildId, currentSection, currentLogsTab]) => {
		try {
			localStorage.setItem(
				ACTIVE_GUILD_STORAGE_KEY,
				JSON.stringify({ guildId, logsTab: currentLogsTab, section: currentSection }),
			);
		} catch {
			// Persistence is a convenience; the in-memory state still works.
		}
	});
});
