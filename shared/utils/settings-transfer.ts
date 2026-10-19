import type { AutoModerationRule } from "#shared/utils/automod-rules";

// The file the dashboard exports and imports is the one the bot's
// `/settings server export` writes (wolfstar-project/wolfstar, V7,
// `projects/bot/src/lib/database/settings/transfer`), so a file made by one is
// read by the other.

/**
 * The version of the file. It changes when a file of the previous version can
 * no longer be read, which a setting or a field that is added does not do.
 */
export const ConfigurationFileVersion = 1;

/** The most bytes of a file an import reads. */
export const MaximumConfigurationFileSize = 1024 * 1024;

export const ConfigurationFileName = "wolfstar-settings.json";

/** What is wrong with a part of a file. */
export interface ConfigurationIssue {
	/** Where in the file, `settings.language` or `automod.rules[2]`. Empty for the file as a whole. */
	path: string;
	message: string;
}

/** A setting an import changes, by its name in the file. */
export interface ConfigurationSettingChange {
	name: string;
	before: unknown;
	after: unknown;
}

/** What an import does to the auto-moderation rules, by their names. */
export interface ConfigurationRulesChange {
	created: string[];
	/** The rules that keep their place and have fields that differ. */
	updated: { name: string; fields: string[] }[];
	/** The rules made again to be where the file has them: they keep their exempt roles and channels. */
	moved: string[];
	removed: string[];
	unchanged: number;
}

/** What an import would do, or did, to a server. */
export interface ConfigurationPreview {
	settings: ConfigurationSettingChange[];
	/** `null` when the file has no `automod` section: the rules of the server are left alone. */
	rules: ConfigurationRulesChange | null;
	/** The settings of the file this dashboard does not manage: they are left out. */
	unsupported: string[];
	/** Whether the server already is as the file says. */
	isEmpty: boolean;
}

/** The body of `POST /api/guilds/:guild/settings/import`. */
export interface ConfigurationImportRequest {
	/** The content of the file. */
	text: string;
	/** Write what the file says; without it the file is only read and what it would change is answered. */
	apply?: boolean;
}

export type ConfigurationImportResponse =
	| { ok: false; issues: ConfigurationIssue[] }
	| { ok: true; applied: false; preview: ConfigurationPreview }
	| {
			ok: true;
			applied: true;
			preview: ConfigurationPreview;
			/** The settings of the server as they are now, as `GET .../settings` answers them. */
			settings: Record<string, unknown>;
			rules: AutoModerationRule[];
	  };
