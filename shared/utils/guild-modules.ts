import type { ToggleSettingKey } from "../types/configurableData";

/**
 * The feature modules of the V7 `Modules` table: the dashboard flips them, the
 * bot reads them before running a subsystem.
 *
 * Each entry maps a `modules*` setting to the sidebar label, the `/app`
 * section where the subsystem is configured, and the help copy shown on the
 * module card. Keep this list in step with the `Modules` model of the contract.
 *
 * The table also has `logs` and `commands` columns, which the bot dropped from
 * its settings: they turned nothing off. Commands is a section of its own, and
 * so is Logs, the records of what happened, which sits next to it in the
 * sidebar.
 */
export const GUILD_MODULES = [
	{
		descriptionKey: "guild_settings.modules.descriptions.automod",
		icon: "lucide:shield-alert",
		key: "modulesAutomod",
		labelKey: "dashboard.nav.automod",
		section: "automod",
	},
	{
		descriptionKey: "guild_settings.modules.descriptions.moderation",
		icon: "lucide:gavel",
		key: "modulesModeration",
		labelKey: "dashboard.nav.moderation",
		section: "moderation",
	},
	{
		descriptionKey: "guild_settings.modules.descriptions.roles",
		icon: "lucide:users",
		key: "modulesRoles",
		labelKey: "dashboard.nav.roles",
		section: "roles",
	},
] as const satisfies readonly {
	descriptionKey: string;
	icon: string;
	key: Extract<ToggleSettingKey, `modules${string}`>;
	labelKey: string;
	section: string;
}[];

export type GuildModuleEntry = (typeof GUILD_MODULES)[number];
type GuildModuleKey = GuildModuleEntry["key"];

/**
 * The switches of the modules that have a table of their own rather than a
 * flag of `Modules`. They are shown, counted and flipped with the flags.
 */
export const OWN_TABLE_MODULE_SWITCHES = [
	"appealsEnabled",
] as const satisfies readonly ToggleSettingKey[];

type ModuleSwitchKey = GuildModuleKey | (typeof OWN_TABLE_MODULE_SWITCHES)[number];

/** Every module switch: the `Modules` flags, then the switches of the other modules. */
export const MODULE_SWITCH_KEYS: readonly ModuleSwitchKey[] = [
	...GUILD_MODULES.map((module) => module.key),
	...OWN_TABLE_MODULE_SWITCHES,
];

export type GuildModuleFlags = Partial<Record<ModuleSwitchKey, boolean | null | undefined>>;

/** Counts the module switches that are on in `settings`. */
export function countEnabledModules(settings: GuildModuleFlags | null | undefined): number {
	if (!settings) {
		return 0;
	}

	return MODULE_SWITCH_KEYS.filter((key) => settings[key] === true).length;
}
