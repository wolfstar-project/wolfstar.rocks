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
	/**
	 * The section is announced but not built: the bot has the feature, the
	 * dashboard has no routes for it yet, so it opens a placeholder page.
	 */
	comingSoon?: boolean;
	/** What the section will do, for its placeholder page. */
	descriptionKey?: string;
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
		icon: "ic:round-shield",
		labelKey: "dashboard.nav.automod",
		moduleKey: "modulesAutomod",
		shortLabelKey: "dashboard.nav.automod_short",
		slug: "automod",
	},
	{
		group: "modules",
		icon: "ic:round-gavel",
		labelKey: "dashboard.nav.moderation",
		moduleKey: "modulesModeration",
		slug: "moderation",
	},
	{
		group: "modules",
		icon: "ic:round-notifications",
		labelKey: "dashboard.nav.channels",
		moduleKey: "modulesLogs",
		slug: "channels",
	},
	{
		group: "modules",
		icon: "ic:round-terminal",
		labelKey: "dashboard.nav.commands",
		moduleKey: "modulesCommands",
		slug: "commands",
	},
	{
		group: "modules",
		icon: "ic:round-people",
		labelKey: "dashboard.nav.roles",
		moduleKey: "modulesRoles",
		slug: "roles",
	},
	{
		comingSoon: true,
		descriptionKey: "dashboard.coming_soon.autodelete",
		group: "modules",
		icon: "ic:round-timer",
		labelKey: "dashboard.nav.autodelete",
		slug: "autodelete",
	},
	{
		comingSoon: true,
		descriptionKey: "dashboard.coming_soon.autopurge",
		group: "modules",
		icon: "ic:round-cleaning-services",
		labelKey: "dashboard.nav.autopurge",
		slug: "autopurge",
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
