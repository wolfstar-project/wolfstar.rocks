/**
 * The toggleable moderation modules the dashboard exposes as cards.
 *
 * Each entry maps a `selfmod*Enabled` guild setting to the sidebar label,
 * the filter page slug under `/manage/moderation/` and the help copy shown
 * on the module card. Keep this list in step with `GuildData`.
 */
export const GUILD_MODULES = [
	{
		descriptionKey: "guild_settings.filter.word.toggle_help",
		icon: "lucide:message-square-warning",
		key: "selfmodFilterEnabled",
		labelKey: "dashboard.nav.bad_words",
		slug: "word",
	},
	{
		descriptionKey: "guild_settings.filter.capitals.toggle_help",
		icon: "lucide:case-upper",
		key: "selfmodCapitalsEnabled",
		labelKey: "dashboard.nav.capitals",
		slug: "capitals",
	},
	{
		descriptionKey: "guild_settings.filter.invites.toggle_help",
		icon: "lucide:user-plus",
		key: "selfmodInvitesEnabled",
		labelKey: "dashboard.nav.invites",
		slug: "invites",
	},
	{
		descriptionKey: "guild_settings.filter.links.toggle_help",
		icon: "lucide:link",
		key: "selfmodLinksEnabled",
		labelKey: "dashboard.nav.links",
		slug: "links",
	},
	{
		descriptionKey: "guild_settings.filter.messages.toggle_help",
		icon: "lucide:copy",
		key: "selfmodMessagesEnabled",
		labelKey: "dashboard.nav.message_duplication",
		slug: "messages",
	},
	{
		descriptionKey: "guild_settings.filter.lines.toggle_help",
		icon: "lucide:wrap-text",
		key: "selfmodNewlinesEnabled",
		labelKey: "dashboard.nav.line_spam",
		slug: "lines",
	},
	{
		descriptionKey: "guild_settings.filter.reactions.toggle_help",
		icon: "lucide:smile",
		key: "selfmodReactionsEnabled",
		labelKey: "dashboard.nav.reactions",
		slug: "reactions",
	},
] as const;

export type GuildModuleEntry = (typeof GUILD_MODULES)[number];
type GuildModuleKey = GuildModuleEntry["key"];

export type GuildModuleFlags = Partial<Record<GuildModuleKey, boolean | null | undefined>>;

/** Counts the modules whose enable flag is set in `settings`. */
export function countEnabledModules(settings: GuildModuleFlags | null | undefined): number {
	if (!settings) {
		return 0;
	}

	return GUILD_MODULES.filter((module) => settings[module.key] === true).length;
}

/** The `/app` section where a module is configured. */
export function guildModuleSection(slug: GuildModuleEntry["slug"]): string {
	return `moderation/${slug}`;
}
