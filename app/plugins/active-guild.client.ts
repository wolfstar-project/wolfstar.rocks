import {
	ACTIVE_GUILD_STORAGE_KEY,
	isValidGuildId,
	useActiveGuild,
} from "~/composables/useActiveGuild";

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
					section.value = stored.section;
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
