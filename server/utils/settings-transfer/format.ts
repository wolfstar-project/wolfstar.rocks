import type { ReadonlyGuildData, StoredKey } from "#server/database/settings";
import type { AutoModerationRule, AutoModerationRuleData } from "#shared/utils/automod-rules";
import { ConfigurationFileVersion } from "#shared/utils/settings-transfer";

/**
 * The settings of the file this dashboard manages, by the name the bot's
 * settings menu gives them and the key `GuildData` has them under.
 *
 * A setting names something of the server it was written in (a role, a
 * channel, a user, a set of them) unless it is of a kind that is the same in
 * every server, so only those are in the file. A setting of a file that is not
 * listed here is left out when the bot has it ({@linkcode BotOnlySettings}),
 * and refused otherwise.
 *
 * @remarks Mirrors `getPortableKeys()` in the bot, which is built from its
 * schema: add a setting here when its column is added to `columns.ts`.
 */
export const TransferableSettings = [
	["language", "language"],
	["timezone", "timezone"],
	["modules.automod", "modulesAutomod"],
	["modules.moderation", "modulesModeration"],
	["modules.roles", "modulesRoles"],
	["modules.logs", "modulesLogs"],
	["modules.autodelete", "modulesAutodelete"],
	["modules.autopurge", "modulesAutopurge"],
	["modules.automessage", "modulesAutomessage"],
	["modules.reports", "modulesReports"],
	["modules.honeypot", "modulesHoneypot"],
	["automod.track-native", "automodTrackNative"],
	["commands.disabled", "commandsDisabled"],
	["honeypot.action", "honeypotAction"],
	["honeypot.direct-message", "honeypotDirectMessage"],
	["honeypot.warning", "honeypotWarning"],
	["honeypot.random-name", "honeypotRandomName"],
	["honeypot.keep-active", "honeypotKeepActive"],
	["honeypot.forward-message", "honeypotForwardMessage"],
	["honeypot.timeout-first", "honeypotTimeoutFirst"],
	["honeypot.recent-delete", "honeypotRecentDelete"],
	["honeypot.chaos-name", "honeypotChaosName"],
	["honeypot.ensure-deletion", "honeypotEnsureDeletion"],
	["join-guard.enabled", "joinGuardEnabled"],
	["join-guard.direct-message", "joinGuardDirectMessage"],
	["join-guard.direct-message-content", "joinGuardDirectMessageContent"],
	["join-guard.checkpoint", "joinGuardCheckpoint"],
	["join-guard.checkpoint-timeout", "joinGuardCheckpointTimeout"],
	["join-guard.minimum-trust", "joinGuardMinimumTrust"],
	["join-guard.captcha", "joinGuardCaptcha"],
	["join-guard.connections", "joinGuardConnections"],
	["join-guard.shared-bans", "joinGuardSharedBans"],
	["appeals.enabled", "appealsEnabled"],
	["appeals.bans", "appealsBans"],
	["appeals.mutes", "appealsMutes"],
	["appeals.timeouts", "appealsTimeouts"],
	["appeals.anonymous", "appealsAnonymous"],
	["appeals.thread", "appealsThread"],
	["appeals.cooldown-days", "appealsCooldownDays"],
	["appeals.max-active", "appealsMaxActive"],
	["appeals.block-on-denial", "appealsBlockOnDenial"],
	["logs.message-update-style", "logsMessageUpdateStyle"],
	["logs.reaction-emoji-include-twemoji", "logsReactionEmojiIncludeTwemoji"],
	["logs.webhooks", "logsWebhooks"],
	["moderation.track-bans", "moderationTrackBans"],
	["moderation.track-timeouts", "moderationTrackTimeouts"],
	["moderation.track-roles", "moderationTrackRoles"],
	["moderation.track-kicks", "moderationTrackKicks"],
	["moderation.confirm-recent", "moderationConfirmRecentMinutes"],
	["moderation.mute-timeout", "moderationMuteTimeout"],
	["moderation.dehoist", "moderationDehoist"],
	["moderation.default-warn-thresholds", "moderationDefaultWarnThresholds"],
	["moderation.direct-message", "messagesModerationDm"],
	["moderation.display-reason", "messagesModerationReasonDisplay"],
	["moderation.display-message", "messagesModerationMessageDisplay"],
	["moderation.display-moderator", "messagesModeratorNameDisplay"],
	["moderation.response-ban", "messagesResponseBan"],
	["moderation.response-unban", "messagesResponseUnban"],
	["moderation.response-softban", "messagesResponseSoftban"],
	["moderation.response-kick", "messagesResponseKick"],
	["moderation.response-mute", "messagesResponseMute"],
	["moderation.response-unmute", "messagesResponseUnmute"],
	["reports.anonymous", "reportsAnonymous"],
	["reports.notify", "reportsNotify"],
	["roles.remove-initial", "rolesRemoveInitial"],
] as const satisfies readonly (readonly [name: string, key: StoredKey])[];

export type TransferableSettingName = (typeof TransferableSettings)[number][0];
export type TransferableSettingKey = (typeof TransferableSettings)[number][1];

const SettingsByName: ReadonlyMap<string, TransferableSettingKey> = new Map(TransferableSettings);

export function findTransferableSetting(name: string): TransferableSettingKey | null {
	return SettingsByName.get(name) ?? null;
}

/**
 * The settings of the file of the bot that this dashboard does not manage: an
 * import leaves them out and says so, where a name nobody has refuses the file.
 *
 * @remarks The rest of `getPortableKeys()` in the bot: a setting moves to
 * {@linkcode TransferableSettings} once its column is in `columns.ts` and the
 * dashboard may write it.
 */
export const BotOnlySettings: ReadonlySet<string> = new Set([
	"honeypot.reinvite",
	"honeypot.recreate",
]);

export function getTransferableSettingName(key: TransferableSettingKey): string {
	return TransferableSettings.find(([, entry]) => entry === key)?.[0] ?? key;
}

/**
 * The settings the bot no longer has, which a file exported before may still
 * hold: an import leaves them out instead of reporting them. The questions of
 * the appeals became the first form of the guild, which a file does not carry.
 */
export const RemovedSettings: ReadonlySet<string> = new Set([
	"appeals.questions",
	"modules.commands",
]);

/**
 * The fields of a rule of the file. What names something of the server
 * (`ignoredRoles`, `ignoredChannels`, `logChannelId`) and what is of the
 * database (`id`, `guildId`) are not in it.
 */
export const ConfigurationRuleFields = [
	"name",
	"type",
	"enabled",
	"softAction",
	"hardAction",
	"hardActionDuration",
	"thresholdMaximum",
	"thresholdDuration",
	"options",
	"escalation",
	"escalationDuration",
	"response",
] as const satisfies readonly (keyof AutoModerationRuleData)[];

export type ConfigurationRule = Pick<
	AutoModerationRuleData,
	(typeof ConfigurationRuleFields)[number]
>;

export interface ConfigurationFile {
	version: typeof ConfigurationFileVersion;
	/** When the file was made, as an ISO 8601 date. Informative: an import does not read it. */
	exportedAt: string;
	settings: Record<string, unknown>;
	automod: { rules: ConfigurationRule[] };
}

export function toConfigurationRule(rule: ConfigurationRule): ConfigurationRule {
	return {
		name: rule.name,
		type: rule.type,
		enabled: rule.enabled,
		softAction: rule.softAction,
		hardAction: rule.hardAction,
		hardActionDuration: rule.hardActionDuration,
		thresholdMaximum: rule.thresholdMaximum,
		thresholdDuration: rule.thresholdDuration,
		options: rule.options,
		escalation: rule.escalation,
		escalationDuration: rule.escalationDuration,
		response: rule.response,
	};
}

/**
 * Makes the file of the configuration of a guild.
 *
 * @param settings The settings of the guild.
 * @param rules The auto-moderation rules of the guild, oldest first.
 * @param exportedAt When the file is made.
 */
export function createConfigurationFile(
	settings: ReadonlyGuildData,
	rules: readonly AutoModerationRule[],
	exportedAt: Date = new Date(),
): ConfigurationFile {
	const values: Record<string, unknown> = {};
	for (const [name, key] of TransferableSettings) {
		const value = settings[key];
		values[name] = Array.isArray(value) ? [...value] : value;
	}

	return {
		version: ConfigurationFileVersion,
		exportedAt: exportedAt.toISOString(),
		settings: values,
		automod: { rules: rules.map((rule) => toConfigurationRule(rule)) },
	};
}
