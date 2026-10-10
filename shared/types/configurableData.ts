import type { GuildData } from "#server/database";

/**
 * The settings of `GuildData` whose value is exactly `Value`, so an entry list
 * can only name keys a control of its kind can edit.
 */
export type GuildSettingKeyOf<Value> = {
	[Key in keyof GuildData]-?: [GuildData[Key]] extends [Value]
		? [Value] extends [GuildData[Key]]
			? Key
			: never
		: never;
}[keyof GuildData];

/** A setting that holds one channel or role, or nothing. */
export type SingleSettingKey = Exclude<GuildSettingKeyOf<string | null>, "id">;
/** A setting that holds a list of channels, roles or command names. */
export type ListSettingKey = GuildSettingKeyOf<string[]>;
/** A setting that is switched on or off. */
export type ToggleSettingKey = GuildSettingKeyOf<boolean>;

/** A setting the dashboard renders a control for, with its English copy. */
export interface SettingEntry<Key extends keyof GuildData = keyof GuildData> {
	key: Key;
	name: string;
	description: string;
}

export namespace Roles {
	interface RoleGroup {
		group: "standard" | "restricted";
	}

	/** A setting that holds several roles. */
	export interface ManyRole
		extends SettingEntry<Extract<ListSettingKey, `roles${string}`>>, RoleGroup {
		many: true;
	}

	/** A setting that holds one role, or nothing. */
	export interface OneRole
		extends SettingEntry<Extract<SingleSettingKey, `roles${string}`>>, RoleGroup {
		many: false;
	}

	export type Role = ManyRole | OneRole;
}

export namespace DisableCommands {
	export interface Command {
		category: string;

		description: string;

		isEnabled: boolean;

		name: string;
	}
}
