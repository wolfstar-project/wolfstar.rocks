import type { SingleSettingKey } from "#shared/types";
import type { ModuleSwitchKey } from "#shared/utils/guild-modules";

/**
 * `overview` and `tools` have no title: the overview holds the two pages about
 * the server, `modules` the feature modules, and `tools` what is not a module:
 * the commands and the logs.
 */
export type DashboardNavGroup = "overview" | "modules" | "tools";

export interface DashboardNavItem {
	/** Section slug the item opens; `""` is the overview. */
	slug: string;
	labelKey: string;
	icon: string;
	group: DashboardNavGroup;
	/**
	 * The switch that turns the section's feature on, when it has one: a flag
	 * of the `Modules` table, or the switch of the feature's own table.
	 */
	moduleKey?: ModuleSwitchKey;
	/** A setting the feature does nothing without, such as the honeypot's channel. */
	requiredKey?: SingleSettingKey;
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
		icon: "ic:round-people",
		labelKey: "dashboard.nav.roles",
		moduleKey: "modulesRoles",
		slug: "roles",
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
		icon: "ic:round-hive",
		labelKey: "dashboard.nav.honeypot",
		requiredKey: "honeypotChannel",
		slug: "honeypot",
	},
	{
		group: "modules",
		icon: "ic:round-rate-review",
		labelKey: "dashboard.nav.appeals",
		moduleKey: "appealsEnabled",
		slug: "appeals",
	},
	{
		group: "modules",
		icon: "ic:round-timer",
		labelKey: "dashboard.nav.autodelete",
		moduleKey: "modulesAutodelete",
		slug: "autodelete",
	},
	{
		group: "modules",
		icon: "ic:round-cleaning-services",
		labelKey: "dashboard.nav.autopurge",
		moduleKey: "modulesAutopurge",
		slug: "autopurge",
	},
	{
		group: "modules",
		icon: "ic:round-schedule-send",
		labelKey: "dashboard.nav.automessage",
		moduleKey: "modulesAutomessage",
		slug: "automessage",
	},
	{
		group: "tools",
		icon: "ic:round-terminal",
		labelKey: "dashboard.nav.commands",
		slug: "commands",
	},
	{
		group: "tools",
		icon: "ic:round-admin-panel-settings",
		labelKey: "dashboard.nav.access",
		slug: "access",
	},
	{
		group: "tools",
		icon: "ic:round-description",
		labelKey: "dashboard.nav.logs",
		slug: "logs",
	},
];

export function findDashboardNavItem(slug: string): DashboardNavItem | undefined {
	return DASHBOARD_NAV.find((item) => item.slug === slug);
}

/** The shape a section's loading skeleton takes. */
export type DashboardSkeletonKind = "overview" | "modules" | "table" | "form";

// The sections whose page is a list of rows rather than a form.
const TABLE_SECTIONS: ReadonlySet<string> = new Set(["automod", "autodelete", "autopurge", "logs"]);

/**
 * Which skeleton stands in for a section while it loads: the overview and the
 * modules grid their own, the logs and the lists of rows a table, every other
 * settings page a form.
 */
export function dashboardSkeletonKind(slug: string): DashboardSkeletonKind {
	if (slug === "") return "overview";
	if (slug === "modules") return "modules";
	if (TABLE_SECTIONS.has(slug)) return "table";
	return "form";
}
