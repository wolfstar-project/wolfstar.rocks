/**
 * The guild the dashboard is showing and the section open inside it.
 *
 * `/app` is a single page: the guild snowflake never appears in the URL. It
 * lives here (and is mirrored to localStorage by `plugins/active-guild.client.ts`)
 * so a reload or a new tab lands back on the same server and section.
 */
export const ACTIVE_GUILD_STORAGE_KEY = "wolfstar-active-guild";

/** The Home section (`General.vue`); every other section is its manage slug. */
export const DEFAULT_DASHBOARD_SECTION = "";

export interface PendingDashboardNavigation {
	guildId?: string | null;
	section?: string;
}

const GUILD_ID_PATTERN = /^\d{17,19}$/;

export function isValidGuildId(id: unknown): id is string {
	return typeof id === "string" && GUILD_ID_PATTERN.test(id);
}

export function useActiveGuild() {
	const activeGuildId = useState<string | null>("app:active-guild", () => null);
	const section = useState<string>("app:section", () => DEFAULT_DASHBOARD_SECTION);
	const logsTab = useState<string>("app:logs-tab", () => "moderation");
	const pendingNavigation = useState<PendingDashboardNavigation | null>(
		"app:pending-navigation",
		() => null,
	);

	function selectGuild(guildId: string | null) {
		const next = isValidGuildId(guildId) ? guildId : null;
		if (next === activeGuildId.value) {
			return;
		}
		activeGuildId.value = next;
		section.value = DEFAULT_DASHBOARD_SECTION;
	}

	function setSection(slug: string) {
		section.value = slug;
	}

	return { activeGuildId, logsTab, pendingNavigation, section, selectGuild, setSection };
}
