import type { GuildModuleEntry } from "#shared/utils/guild-modules";

export type DashboardNavGroup = "overview" | "modules" | "records";

export interface DashboardNavItem {
	/** Section slug the item opens; `""` is the overview. */
	slug: string;
	labelKey: string;
	/** Shorter label for places with little room, such as the phone tab bar. */
	shortLabelKey?: string;
	icon: string;
	group: DashboardNavGroup;
	/** The `modules*` flag the section configures, when it configures one. */
	moduleKey?: GuildModuleEntry["key"];
}

/**
 * Every section of `/app`, in sidebar order. The sidebar, the phone tab bar and
 * the page title all read this list, so a section is added in one place.
 */
export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
	{ group: "overview", icon: "ic:round-dashboard", labelKey: "dashboard.nav.overview", slug: "" },
	{
		group: "overview",
		icon: "ic:round-grid-view",
		labelKey: "dashboard.nav.modules",
		slug: "modules",
	},
	{
		group: "modules",
		icon: "ic:round-gavel",
		labelKey: "dashboard.nav.moderation",
		slug: "moderation",
	},
	{
		group: "modules",
		icon: "ic:round-text-fields",
		labelKey: "dashboard.nav.bad_words",
		slug: "moderation/word",
	},
	{
		group: "modules",
		icon: "ic:round-format-size",
		labelKey: "dashboard.nav.capitals",
		slug: "moderation/capitals",
	},
	{
		group: "modules",
		icon: "ic:round-public",
		labelKey: "dashboard.nav.invites",
		slug: "moderation/invites",
	},
	{
		group: "modules",
		icon: "ic:round-link",
		labelKey: "dashboard.nav.links",
		slug: "moderation/links",
	},
	{
		group: "modules",
		icon: "ic:round-content-copy",
		labelKey: "dashboard.nav.message_duplication",
		slug: "moderation/messages",
	},
	{
		group: "modules",
		icon: "ic:round-wrap-text",
		labelKey: "dashboard.nav.line_spam",
		slug: "moderation/lines",
	},
	{
		group: "modules",
		icon: "ic:round-emoji-emotions",
		labelKey: "dashboard.nav.reactions",
		slug: "moderation/reactions",
	},
	{
		group: "modules",
		icon: "ic:round-tag",
		labelKey: "dashboard.nav.channels",
		slug: "channels",
	},
	{
		group: "modules",
		icon: "ic:round-people",
		labelKey: "dashboard.nav.roles",
		slug: "roles",
	},
	{
		group: "modules",
		icon: "ic:round-notifications",
		labelKey: "dashboard.nav.events",
		slug: "events",
	},
	{
		group: "modules",
		icon: "ic:round-terminal",
		labelKey: "dashboard.nav.commands",
		slug: "commands",
	},
	{
		group: "records",
		icon: "ic:round-description",
		labelKey: "dashboard.nav.logs",
		slug: "logs",
	},
];

export function findDashboardNavItem(slug: string): DashboardNavItem | undefined {
	return DASHBOARD_NAV.find((item) => item.slug === slug);
}
