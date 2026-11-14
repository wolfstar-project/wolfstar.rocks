import type { AutoModerationRule } from "#shared/utils/automod-rules";

// The file the dashboard exports and imports is the one the bot's
// `/settings server export` writes (wolfstar-project/wolfstar, V7,
// `projects/bot/src/lib/database/settings/transfer`), so a file made by one is
// read by the other.

/**
 * The version of the file an export writes. It changes when a file of the
 * previous version can no longer be read as it is, which a setting or a field
 * that is added does not do. Version 1 is also the file of the bot before V7,
 * which an import still reads, to move a server to V7.
 */
export const ConfigurationFileVersion = 2;

/** The versions an import reads: the one an export writes, and the ones before it, which the import upgrades. */
export const ReadableConfigurationFileVersions: readonly number[] = [1, ConfigurationFileVersion];

/** The most bytes of a file an import reads. */
export const MaximumConfigurationFileSize = 1024 * 1024;

export const ConfigurationFileName = "wolfstar-settings.json";

/** What is wrong with a part of a file. */
export interface ConfigurationIssue {
	/** Where in the file, `settings.language` or `automod.rules[2]`. Empty for the file as a whole. */
	path: string;
	message: string;
}

/**
 * What a file of the bot before V7 has that an import cannot carry over, with
 * how to set it by hand. The import goes on without it, so it is shown with
 * the preview instead of refusing the file. `path` is where in the file, as for
 * a {@linkcode ConfigurationIssue}; the reasons are the server's own text.
 */
export type ConfigurationNotice =
	/** A renamed setting whose value V7 refuses: `target` is set by hand. */
	| { kind: "settingFailed"; path: string; name: string; target: string; reason: string }
	/** A setting V7 has nothing for, which was changed from the default of the bot before V7. */
	| { kind: "noEquivalent"; path: string; name: string }
	/** The reaction filter, which V7 has no rule for. */
	| { kind: "reactionFilter"; path: string; name: string }
	/** A filter that became a rule, changed to fit the limits of V7. */
	| { kind: "ruleAdjusted"; path: string; rule: string; detail: string }
	/** A filter that could not become a rule: the rule is created by hand. */
	| { kind: "ruleFailed"; path: string; rule: string; reason: string };

/** A setting an import changes, by its name in the file. */
interface ConfigurationSettingChange {
	name: string;
	before: unknown;
	after: unknown;
}

/** What an import does to the auto-moderation rules, by their names. */
interface ConfigurationRulesChange {
	/**
	 * `replace` when the rules of the server become the ones of the file;
	 * `add` when the file has no `automod` section and its filters of the bot
	 * before V7 are added to the rules of the server, one with the name of a
	 * rule of the server taking its place.
	 */
	mode: "replace" | "add";
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
	/** `null` when the import leaves the rules of the server alone. */
	rules: ConfigurationRulesChange | null;
	/** The settings of the file this dashboard does not manage: they are left out. */
	unsupported: string[];
	/** What a file of the bot before V7 has that is not imported, shown even when nothing changes. */
	notices: ConfigurationNotice[];
	/** Whether the server already is as the file says. */
	isEmpty: boolean;
}

/** The body of `POST /api/guilds/:guild/settings/import`. */
export interface ConfigurationImportRequest {
	/** The content of the file. */
	text: string;
	/** Write what the file says; without it the file is only read and what it would change is answered. */
	apply?: boolean;
	/**
	 * With `apply`, the notices the preview showed, as {@linkcode getNoticesDigest}
	 * sums them up. The file is read again when it is applied, against the server
	 * as it is then: other notices than the preview's, such as a filter left out
	 * because the server reached its rules meanwhile, refuse the import as the
	 * server having changed, instead of leaving out what was confirmed.
	 */
	noticesDigest?: string;
}

/**
 * Sums up the notices of a preview in a few characters, whatever their number,
 * for the import that follows it to tell whether reading the file again found
 * other ones. Not a secret: a collision only lets through an import whose
 * server changed in a way the notices would have told.
 */
export function getNoticesDigest(notices: readonly ConfigurationNotice[]): string {
	const text = notices
		.map((notice) => JSON.stringify(notice))
		.toSorted()
		.join("\n");
	// cyrb53, 53 bits from two 32-bit hashes; its seeds 0xDEADBEEF and 0x41C6CE57 are
	// written in decimal, as the linter and the formatter disagree on hex case:
	let first = 3_735_928_559;
	let second = 1_103_547_991;
	for (let index = 0; index < text.length; index++) {
		const code = text.charCodeAt(index);
		first = Math.imul(first ^ code, 2_654_435_761);
		second = Math.imul(second ^ code, 1_597_334_677);
	}
	first = Math.imul(first ^ (first >>> 16), 2_246_822_507);
	first ^= Math.imul(second ^ (second >>> 13), 3_266_489_909);
	second = Math.imul(second ^ (second >>> 16), 2_246_822_507);
	second ^= Math.imul(first ^ (first >>> 13), 3_266_489_909);
	return (4_294_967_296 * (2_097_151 & second) + (first >>> 0)).toString(36);
}

/**
 * The settings a file may set that the dashboard has no field for: a notice
 * that one of them could not be imported points to the bot's `/settings`.
 */
export const SettingsSetWithTheBot: ReadonlySet<string> = new Set([
	"moderation.direct-message",
	"moderation.display-reason",
	"moderation.display-message",
	"moderation.display-moderator",
]);

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
