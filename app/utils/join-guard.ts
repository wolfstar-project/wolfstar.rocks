import type {
	JoinGuardCheckpointStatus,
	JoinGuardHardAction,
	JoinGuardQueueEntry,
	JoinGuardRuleInput,
	JoinGuardRuleProblem,
	JoinGuardTrust,
	JoinGuardTrustGap,
} from "#shared/utils/join-guard";
import {
	accountAgeDays,
	accountAgeSeconds,
	JoinGuardAccountAgeDays,
	JoinGuardCheckpointTimeoutHours,
	JoinGuardLimits,
	timeoutHours,
	timeoutSeconds,
} from "#shared/utils/join-guard";

/**
 * The words of the Join Guard section and of the verification page, built
 * from a rule, a row of the queue or a trust level. Nothing here reads a
 * store: the translations and the names of the roles and channels are handed
 * in, so every helper is tested with plain values.
 */

/** The two translation calls of `useI18n()` the helpers need. */
export interface JoinGuardText {
	ts: (key: string, params?: Record<string, string | number>) => string;
	tc: (key: string, params: number | Record<string, string | number>) => string;
}

/** The names of the roles and channels a rule names, or `null` when they are gone. */
export interface JoinGuardNames {
	role: (id: string) => string | null;
	channel: (id: string) => string | null;
}

/** The tones of the design's tags; the colours are the theme's tokens. */
export type JoinGuardTone = "error" | "warning" | "success" | "primary" | "neutral";

// -----------------------------------------------------------------------------
// The rules
// -----------------------------------------------------------------------------

type RuleShape = Pick<
	JoinGuardRuleInput,
	| "accountAgeMax"
	| "defaultAvatar"
	| "generatedName"
	| "nameContains"
	| "unverifiedBot"
	| "sendToCheckpoint"
	| "roleId"
	| "directMessage"
	| "alertChannelId"
	| "hardAction"
>;

/**
 * The tone of a rule's "WolfStar" tags: a rule that ends the join is a danger,
 * one that holds the member at the checkpoint is the brand's, and one that
 * only tells or tags is a warning.
 */
export function joinGuardRuleTone(
	rule: Pick<RuleShape, "hardAction" | "sendToCheckpoint">,
): JoinGuardTone {
	if (rule.hardAction !== null) return "error";
	return rule.sendToCheckpoint ? "primary" : "warning";
}

function roleLabel(id: string, names: JoinGuardNames, text: JoinGuardText): string {
	return `@${names.role(id) ?? text.ts("guild_settings.joinguard.rules.unknown_role")}`;
}

function channelLabel(id: string, names: JoinGuardNames, text: JoinGuardText): string {
	return `#${names.channel(id) ?? text.ts("guild_settings.joinguard.rules.unknown_channel")}`;
}

/** The "When the account has" tags of a rule card. */
export function joinGuardConditionChips(rule: RuleShape, text: JoinGuardText): string[] {
	const chips: string[] = [];
	if (rule.accountAgeMax !== null) {
		chips.push(
			text.tc("guild_settings.joinguard.chips.account_age", {
				count: accountAgeDays(rule.accountAgeMax),
			}),
		);
	}
	if (rule.defaultAvatar) chips.push(text.ts("guild_settings.joinguard.chips.default_avatar"));
	if (rule.generatedName) chips.push(text.ts("guild_settings.joinguard.chips.generated_name"));
	if (rule.nameContains !== null) {
		chips.push(
			text.ts("guild_settings.joinguard.chips.name_contains", { text: rule.nameContains }),
		);
	}
	if (rule.unverifiedBot) chips.push(text.ts("guild_settings.joinguard.chips.unverified_bot"));
	return chips;
}

/** The "WolfStar" tags of a rule card. */
export function joinGuardActionChips(
	rule: RuleShape,
	text: JoinGuardText,
	names: JoinGuardNames,
): string[] {
	const chips: string[] = [];
	if (rule.sendToCheckpoint) chips.push(text.ts("guild_settings.joinguard.chips.checkpoint"));
	if (rule.roleId !== null) chips.push(roleLabel(rule.roleId, names, text));
	if (rule.directMessage) chips.push(text.ts("guild_settings.joinguard.chips.direct_message"));
	if (rule.alertChannelId !== null) {
		chips.push(
			text.ts("guild_settings.joinguard.chips.alert", {
				channel: channelLabel(rule.alertChannelId, names, text),
			}),
		);
	}
	if (rule.hardAction === "Kick") chips.push(text.ts("guild_settings.joinguard.chips.kick"));
	if (rule.hardAction === "Ban") chips.push(text.ts("guild_settings.joinguard.chips.ban"));
	return chips;
}

function joinList(items: string[], locale: string): string {
	return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items);
}

/**
 * The sentence under the editor that says what the rule does, as the design
 * writes it: "A member who joins with an account younger than 7 days is sent
 * to the checkpoint and is told why in a DM, and #mod-chat is alerted." What
 * the rule does not set yet reads as an ellipsis.
 */
export function joinGuardRuleSummary(
	rule: RuleShape,
	text: JoinGuardText,
	names: JoinGuardNames,
	locale: string,
): string {
	const when: string[] = [];
	if (rule.accountAgeMax !== null) {
		when.push(
			text.tc("guild_settings.joinguard.summary.account_age", {
				count: accountAgeDays(rule.accountAgeMax),
			}),
		);
	}
	if (rule.defaultAvatar) when.push(text.ts("guild_settings.joinguard.summary.default_avatar"));
	if (rule.generatedName) when.push(text.ts("guild_settings.joinguard.summary.generated_name"));
	if (rule.nameContains) {
		when.push(
			text.ts("guild_settings.joinguard.summary.name_contains", { text: rule.nameContains }),
		);
	}
	if (rule.unverifiedBot) when.push(text.ts("guild_settings.joinguard.summary.unverified_bot"));

	const then: string[] = [];
	if (rule.hardAction === "Kick") then.push(text.ts("guild_settings.joinguard.summary.kick"));
	if (rule.hardAction === "Ban") then.push(text.ts("guild_settings.joinguard.summary.ban"));
	if (rule.sendToCheckpoint) then.push(text.ts("guild_settings.joinguard.summary.checkpoint"));
	if (rule.roleId !== null) {
		then.push(
			text.ts("guild_settings.joinguard.summary.role", {
				role: roleLabel(rule.roleId, names, text),
			}),
		);
	}
	if (rule.directMessage) then.push(text.ts("guild_settings.joinguard.summary.direct_message"));

	const params = {
		actions: then.length > 0 ? joinList(then, locale) : "…",
		conditions: when.length > 0 ? joinList(when, locale) : "…",
	};
	if (rule.alertChannelId === null)
		return text.ts("guild_settings.joinguard.summary.sentence", params);
	return text.ts("guild_settings.joinguard.summary.sentence_alert", {
		...params,
		channel: channelLabel(rule.alertChannelId, names, text),
	});
}

/**
 * What the rule editor holds while it is filled in. The boxes are kept apart
 * from their values, so a box ticked before its field is filled stays ticked.
 */
export interface JoinGuardRuleDraft {
	name: string;
	enabled: boolean;
	accountAge: boolean;
	/** Whole days; `null` while the field is empty. */
	accountAgeDays: number | null;
	defaultAvatar: boolean;
	generatedName: boolean;
	nameContains: boolean;
	nameContainsText: string;
	unverifiedBot: boolean;
	sendToCheckpoint: boolean;
	giveRole: boolean;
	roleId: string | null;
	directMessage: boolean;
	alert: boolean;
	alertChannelId: string | null;
	hardAction: JoinGuardHardAction | null;
}

/** The days a new rule's age box starts with, as the design's does. */
const JOIN_GUARD_DEFAULT_AGE_DAYS = 7;

/**
 * A new rule, as the design opens it: the account age ticked at 7 days, a
 * direct message, and the checkpoint when the guild has it on.
 */
export function createJoinGuardRuleDraft(checkpointOn: boolean): JoinGuardRuleDraft {
	return {
		accountAge: true,
		accountAgeDays: JOIN_GUARD_DEFAULT_AGE_DAYS,
		alert: false,
		alertChannelId: null,
		defaultAvatar: false,
		directMessage: true,
		enabled: true,
		generatedName: false,
		giveRole: false,
		hardAction: null,
		name: "",
		nameContains: false,
		nameContainsText: "",
		roleId: null,
		sendToCheckpoint: checkpointOn,
		unverifiedBot: false,
	};
}

export function joinGuardRuleToDraft(rule: JoinGuardRuleInput): JoinGuardRuleDraft {
	return {
		accountAge: rule.accountAgeMax !== null,
		accountAgeDays:
			rule.accountAgeMax === null
				? JOIN_GUARD_DEFAULT_AGE_DAYS
				: accountAgeDays(rule.accountAgeMax),
		alert: rule.alertChannelId !== null,
		alertChannelId: rule.alertChannelId,
		defaultAvatar: rule.defaultAvatar,
		directMessage: rule.directMessage,
		enabled: rule.enabled,
		generatedName: rule.generatedName,
		giveRole: rule.roleId !== null,
		hardAction: rule.hardAction,
		name: rule.name,
		nameContains: rule.nameContains !== null,
		nameContainsText: rule.nameContains ?? "",
		roleId: rule.roleId,
		sendToCheckpoint: rule.sendToCheckpoint,
		unverifiedBot: rule.unverifiedBot,
	};
}

/**
 * The rule a draft writes. A ticked age with no number is sent as 0 days and a
 * ticked name text as what was typed, so the validation names the field
 * rather than the rule losing its condition; a role or a channel ticked but
 * not picked is no action yet.
 */
export function joinGuardDraftToInput(draft: JoinGuardRuleDraft): JoinGuardRuleInput {
	return {
		accountAgeMax: draft.accountAge ? accountAgeSeconds(draft.accountAgeDays ?? 0) : null,
		alertChannelId: draft.alert ? draft.alertChannelId : null,
		defaultAvatar: draft.defaultAvatar,
		directMessage: draft.directMessage,
		enabled: draft.enabled,
		generatedName: draft.generatedName,
		hardAction: draft.hardAction,
		name: draft.name.trim(),
		nameContains: draft.nameContains ? draft.nameContainsText.trim() : null,
		roleId: draft.giveRole ? draft.roleId : null,
		sendToCheckpoint: draft.sendToCheckpoint,
		unverifiedBot: draft.unverifiedBot,
	};
}

/**
 * Ticks or unticks the kick or the ban. Both end the join, so they exclude
 * each other, and ticking one turns off what is done to a member who stays:
 * the checkpoint and the role.
 */
export function toggleJoinGuardHardAction(
	draft: JoinGuardRuleDraft,
	action: JoinGuardHardAction,
): JoinGuardRuleDraft {
	if (draft.hardAction === action) return { ...draft, hardAction: null };
	return { ...draft, giveRole: false, hardAction: action, sendToCheckpoint: false };
}

/** Ticks or unticks the checkpoint; ticked, it drops a kick or a ban. */
export function toggleJoinGuardCheckpoint(draft: JoinGuardRuleDraft): JoinGuardRuleDraft {
	const sendToCheckpoint = !draft.sendToCheckpoint;
	return { ...draft, hardAction: sendToCheckpoint ? null : draft.hardAction, sendToCheckpoint };
}

/** Ticks or unticks the role; ticked, it drops a kick or a ban. */
export function toggleJoinGuardRole(draft: JoinGuardRuleDraft): JoinGuardRuleDraft {
	const giveRole = !draft.giveRole;
	return { ...draft, giveRole, hardAction: giveRole ? null : draft.hardAction };
}

/**
 * What the days field holds once typed in: its digits only, at most the four
 * of 9999, and `null` when nothing is left.
 */
export function parseJoinGuardDays(value: string | number | null | undefined): number | null {
	const digits = String(value ?? "")
		.replaceAll(/\D/g, "")
		.slice(0, String(JoinGuardAccountAgeDays.maximum).length);
	return digits === "" ? null : Number(digits);
}

/** The text of the name condition, cut to its limit as it is typed. */
export function clampJoinGuardNameText(value: string): string {
	return value.slice(0, JoinGuardLimits.nameContains);
}

/** The message of each reason the editor refuses a rule. */
export const JOIN_GUARD_PROBLEM_KEYS: Record<JoinGuardRuleProblem, string> = {
	accountAge: "guild_settings.joinguard.problems.account_age",
	actions: "guild_settings.joinguard.problems.actions",
	checkpointOff: "guild_settings.joinguard.problems.checkpoint_off",
	conditions: "guild_settings.joinguard.problems.conditions",
	hardActionConflict: "guild_settings.joinguard.problems.hard_action_conflict",
	name: "guild_settings.joinguard.problems.name",
	nameContains: "guild_settings.joinguard.problems.name_contains",
};

// -----------------------------------------------------------------------------
// The checkpoint
// -----------------------------------------------------------------------------

/** The page a stopped member opens, as a link and as the design prints it. */
export function joinGuardVerifyLink(siteUrl: string, guildId: string) {
	const origin = siteUrl.replace(/\/+$/, "");
	const href = `${origin}/verify/${guildId}`;
	return { href, label: href.replace(/^https?:\/\//, "") };
}

/**
 * The checkpoint's timeout as the hours field shows it: 0 never kicks, and a
 * stored value outside 1 to 168 hours is held to them.
 */
export function joinGuardTimeoutHours(seconds: number | null | undefined): number {
	if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return 0;
	const { maximum, minimum } = JoinGuardCheckpointTimeoutHours;
	return Math.min(maximum, Math.max(minimum, timeoutHours(seconds)));
}

/** Hours typed in the timeout field, held to 0 to 168, in the seconds the bot stores. */
export function joinGuardTimeoutSeconds(hours: number | null | undefined): number {
	if (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0) return 0;
	return timeoutSeconds(Math.min(JoinGuardCheckpointTimeoutHours.maximum, hours));
}

// -----------------------------------------------------------------------------
// Trust
// -----------------------------------------------------------------------------

/** The four trust levels, by their name on the page and in the queue. */
export const JOIN_GUARD_TRUST_KEYS: Record<JoinGuardTrust, string> = {
	0: "guild_settings.joinguard.trust.0",
	1: "guild_settings.joinguard.trust.1",
	2: "guild_settings.joinguard.trust.2",
	3: "guild_settings.joinguard.trust.3",
};

/** What each minimum the guild can ask for takes, on the checkpoint card. */
export const JOIN_GUARD_MINIMUM_TRUST_HELP_KEYS: Record<1 | 2 | 3, string> = {
	1: "guild_settings.joinguard.checkpoint.trust_help.1",
	2: "guild_settings.joinguard.checkpoint.trust_help.2",
	3: "guild_settings.joinguard.checkpoint.trust_help.3",
};

export const JOIN_GUARD_TRUST_TONES: Record<JoinGuardTrust, JoinGuardTone> = {
	0: "error",
	1: "warning",
	2: "success",
	3: "primary",
};

/** What the verification page tells a member to fix, by what keeps them below. */
export const JOIN_GUARD_GAP_KEYS: Record<JoinGuardTrustGap, string> = {
	accountAge: "verify.gaps.account_age",
	avatar: "verify.gaps.avatar",
	badges: "verify.gaps.badges",
	linkedAccount: "verify.gaps.linked_account",
	sharedBan: "verify.gaps.shared_ban",
};

// -----------------------------------------------------------------------------
// The queue
// -----------------------------------------------------------------------------

export const JOIN_GUARD_STATUS_KEYS: Record<JoinGuardCheckpointStatus, string> = {
	Banned: "guild_settings.joinguard.queue.status.banned",
	Kicked: "guild_settings.joinguard.queue.status.kicked",
	Left: "guild_settings.joinguard.queue.status.left",
	Verified: "guild_settings.joinguard.queue.status.verified",
	Waiting: "guild_settings.joinguard.queue.status.waiting",
};

export const JOIN_GUARD_STATUS_TONES: Record<JoinGuardCheckpointStatus, JoinGuardTone> = {
	Banned: "error",
	Kicked: "error",
	Left: "neutral",
	Verified: "success",
	Waiting: "warning",
};

/**
 * What the guard saw on the account, after the rule's name on a row:
 * "default avatar · generated name · no linked accounts".
 */
export function joinGuardSignals(
	entry: Pick<JoinGuardQueueEntry, "defaultAvatar" | "generatedName" | "linkedAccounts">,
	text: JoinGuardText,
): string {
	const signals: string[] = [];
	if (entry.defaultAvatar)
		signals.push(text.ts("guild_settings.joinguard.queue.signals.default_avatar"));
	if (entry.generatedName)
		signals.push(text.ts("guild_settings.joinguard.queue.signals.generated_name"));
	signals.push(
		text.tc("guild_settings.joinguard.queue.signals.linked_accounts", entry.linkedAccounts),
	);
	return signals.join(" · ");
}

/**
 * The line under a row that is no longer waiting: "Verified at the
 * checkpoint", "Kicked by stella", "Left".
 */
export function joinGuardDecision(
	entry: Pick<JoinGuardQueueEntry, "status" | "resolution" | "moderator">,
	text: JoinGuardText,
): string {
	const status = text.ts(JOIN_GUARD_STATUS_KEYS[entry.status]);
	switch (entry.resolution) {
		case "Checkpoint":
			return text.ts("guild_settings.joinguard.queue.decided.checkpoint", { status });
		case "Timeout":
			return text.ts("guild_settings.joinguard.queue.decided.timeout", { status });
		case "Rule":
			return text.ts("guild_settings.joinguard.queue.decided.rule", { status });
		case "Moderator":
			return entry.moderator
				? text.ts("guild_settings.joinguard.queue.decided.moderator", {
						moderator: entry.moderator.displayName || entry.moderator.username,
						status,
					})
				: status;
		default:
			return status;
	}
}

/** How long ago an account was made, in the largest whole unit: "5 days ago". */
export function formatJoinGuardAgo(timestamp: number, now: number, locale: string): string {
	const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
	const format = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
	if (seconds < 3600) return format.format(-Math.max(1, Math.round(seconds / 60)), "minute");
	if (seconds < 86_400) return format.format(-Math.round(seconds / 3600), "hour");
	if (seconds < 86_400 * 60) return format.format(-Math.round(seconds / 86_400), "day");
	if (seconds < 86_400 * 730) return format.format(-Math.round(seconds / (86_400 * 30)), "month");
	return format.format(-Math.round(seconds / (86_400 * 365)), "year");
}

// -----------------------------------------------------------------------------
// The bot's answers
// -----------------------------------------------------------------------------

/** The codes of the bot's `JoinGuardFailure`, each worded by the page. */
const JOIN_GUARD_FAILURE_KEYS: Record<string, string> = {
	Failed: "guild_settings.joinguard.failures.Failed",
	InvalidRequest: "guild_settings.joinguard.failures.InvalidRequest",
	MissingPermissions: "guild_settings.joinguard.failures.MissingPermissions",
	NoChannel: "guild_settings.joinguard.failures.NoChannel",
	NotAllowed: "guild_settings.joinguard.failures.NotAllowed",
	NotMember: "guild_settings.joinguard.failures.NotMember",
	NotWaiting: "guild_settings.joinguard.failures.NotWaiting",
	Refused: "guild_settings.joinguard.failures.Refused",
	RoleNotManageable: "guild_settings.joinguard.failures.RoleNotManageable",
	UnknownChannel: "guild_settings.joinguard.failures.UnknownChannel",
	UnknownGuild: "guild_settings.joinguard.failures.UnknownGuild",
};

/** The message of a failure the bot wrote, or of one the page does not know. */
export function joinGuardFailureKey(code: string): string {
	return Object.hasOwn(JOIN_GUARD_FAILURE_KEYS, code)
		? (JOIN_GUARD_FAILURE_KEYS[code] ?? "guild_settings.joinguard.failures.unknown")
		: "guild_settings.joinguard.failures.unknown";
}

/** The message of each reason a rule route refuses a write, besides the problems. */
export const JOIN_GUARD_RULE_ERROR_KEYS = {
	generic: "guild_settings.joinguard.rules.errors.generic",
	invalid: "guild_settings.joinguard.rules.errors.invalid",
	limit: "guild_settings.joinguard.rules.errors.limit",
	nameTaken: "guild_settings.joinguard.rules.errors.nameTaken",
	unknown: "guild_settings.joinguard.rules.errors.unknown",
} as const;

/** The message of anything a rule route refuses a write with. */
export function joinGuardRuleErrorKey(
	code: JoinGuardRuleProblem | keyof typeof JOIN_GUARD_RULE_ERROR_KEYS,
): string {
	return code in JOIN_GUARD_RULE_ERROR_KEYS
		? JOIN_GUARD_RULE_ERROR_KEYS[code as keyof typeof JOIN_GUARD_RULE_ERROR_KEYS]
		: JOIN_GUARD_PROBLEM_KEYS[code as JoinGuardRuleProblem];
}
