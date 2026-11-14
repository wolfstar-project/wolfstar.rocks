import type { AutomodRuleCreate } from "~/composables/useAutomodRules";
import {
	AutoModerationRuleLimits,
	AutoModerationSoftActionBits,
	normalizeAutoModerationHardAction,
	getDefaultAutoModerationRule,
	MaximumAutoModerationRuleNameLength,
	type AutoModerationEscalationAction,
	type AutoModerationHardAction,
	type AutoModerationRule,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import { toRaw } from "vue";

type AutomodRuleOptionValue = number | boolean | string[];

interface AutomodEscalationDraft {
	action: AutoModerationEscalationAction;
	/** Milliseconds; `0` for a permanent action. */
	duration: number;
}

/**
 * A rule as the editor's form holds it. It differs from the stored rule where
 * a control needs it to: the soft action is three switches rather than a
 * bitfield, and a permanent duration is `0` rather than `null`, which a number
 * field cannot hold.
 */
export interface AutomodRuleDraft {
	name: string;
	type: AutoModerationRuleType;
	enabled: boolean;
	softDelete: boolean;
	softLog: boolean;
	softAlert: boolean;
	hardAction: AutoModerationHardAction;
	hardActionDuration: number;
	thresholdMaximum: number;
	thresholdDuration: number;
	ignoredRoles: string[];
	ignoredChannels: string[];
	options: Record<string, AutomodRuleOptionValue>;
	escalation: AutomodEscalationDraft[];
	escalationDuration: number;
	/** The custom alert; empty for the line of the rule's type. */
	response: string;
	/** `null` for the moderation channel. */
	logChannelId: string | null;
}

type RuleFields = Omit<AutoModerationRule, "id" | "guildId">;

function toDraft(rule: RuleFields): AutomodRuleDraft {
	return {
		name: rule.name,
		type: rule.type,
		enabled: rule.enabled,
		softDelete: (rule.softAction & AutoModerationSoftActionBits.Delete) !== 0,
		softLog: (rule.softAction & AutoModerationSoftActionBits.Log) !== 0,
		softAlert: (rule.softAction & AutoModerationSoftActionBits.Alert) !== 0,
		hardAction: rule.hardAction,
		hardActionDuration: rule.hardActionDuration ?? 0,
		thresholdMaximum: rule.thresholdMaximum,
		thresholdDuration: rule.thresholdDuration,
		ignoredRoles: [...rule.ignoredRoles],
		ignoredChannels: [...rule.ignoredChannels],
		// A rule held in a `ref` hands out reactive proxies, which
		// `structuredClone` refuses to copy.
		options: structuredClone(toRaw(rule.options)) as Record<string, AutomodRuleOptionValue>,
		// `None` is no step: the stored escalation never holds one.
		escalation: rule.escalation.flatMap((step) =>
			step.action === "None" ? [] : [{ action: step.action, duration: step.duration ?? 0 }],
		),
		escalationDuration: rule.escalationDuration,
		response: rule.response ?? "",
		logChannelId: rule.logChannelId,
	};
}

/** The form a new rule of `type` starts with: the bot's own defaults. */
export function createAutomodRuleDraft(type: AutoModerationRuleType): AutomodRuleDraft {
	return toDraft({ ...getDefaultAutoModerationRule(type), name: "" });
}

/** The form an existing rule is edited in. */
export function automodRuleToDraft(rule: AutoModerationRule): AutomodRuleDraft {
	return toDraft(rule);
}

/**
 * The request body a draft is saved with. A duration of `0` goes back to
 * `null`, which is how the bot stores a permanent action.
 */
export function automodRuleDraftToBody(draft: AutomodRuleDraft): AutomodRuleCreate {
	return {
		name: draft.name.trim(),
		type: draft.type,
		enabled: draft.enabled,
		softAction:
			(draft.softDelete ? AutoModerationSoftActionBits.Delete : 0) |
			(draft.softLog ? AutoModerationSoftActionBits.Log : 0) |
			(draft.softAlert ? AutoModerationSoftActionBits.Alert : 0),
		hardAction: draft.hardAction,
		hardActionDuration: draft.hardActionDuration > 0 ? draft.hardActionDuration : null,
		thresholdMaximum: draft.thresholdMaximum,
		thresholdDuration: draft.thresholdDuration,
		ignoredRoles: [...draft.ignoredRoles],
		ignoredChannels: [...draft.ignoredChannels],
		options: structuredClone(toRaw(draft.options)) as AutoModerationRule["options"],
		escalation: draft.escalation.map((step) => ({
			action: step.action,
			duration: step.duration > 0 ? step.duration : null,
		})),
		escalationDuration: draft.escalationDuration,
		// An empty response is none, as the bot reads it:
		response: draft.response.trim() || null,
		logChannelId: draft.logChannelId,
	};
}

export type AutomodRuleNameProblem = "empty" | "tooLong" | "digitsOnly";

/**
 * What is wrong with a rule name, by the rules the server applies: it is not
 * empty, not longer than the limit, and not made of digits only, which could
 * be taken for the ID of another rule.
 */
export function validateAutomodRuleName(name: string): AutomodRuleNameProblem | null {
	const trimmed = name.trim();
	if (trimmed.length === 0) return "empty";
	if (trimmed.length > MaximumAutoModerationRuleNameLength) return "tooLong";
	if (/^\d+$/u.test(trimmed)) return "digitsOnly";
	return null;
}

/** What a new rule starts from besides its type: its actions, threshold and exemptions. */
export type AutomodRuleDefaultFields = Pick<
	AutomodRuleDraft,
	| "softDelete"
	| "softLog"
	| "softAlert"
	| "hardAction"
	| "hardActionDuration"
	| "thresholdMaximum"
	| "thresholdDuration"
	| "ignoredRoles"
	| "ignoredChannels"
>;

/** The escalation a new rule starts with. */
export type AutomodEscalationDefaultFields = Pick<
	AutomodRuleDraft,
	"escalation" | "escalationDuration"
>;

export interface AutomodRuleDefaults {
	rule?: AutomodRuleDefaultFields;
	escalation?: AutomodEscalationDefaultFields;
}

export function pickAutomodRuleDefaults(draft: AutomodRuleDraft): AutomodRuleDefaultFields {
	return {
		hardAction: draft.hardAction,
		hardActionDuration: draft.hardActionDuration,
		ignoredChannels: [...draft.ignoredChannels],
		ignoredRoles: [...draft.ignoredRoles],
		softAlert: draft.softAlert,
		softDelete: draft.softDelete,
		softLog: draft.softLog,
		thresholdDuration: draft.thresholdDuration,
		thresholdMaximum: draft.thresholdMaximum,
	};
}

/**
 * A reset window within what the server accepts. The server checks it whatever
 * the steps, while its field shows only with steps: a default saved without
 * steps, or stored before it was checked, must not fail every new rule.
 */
function escalationWindow(duration: number): number {
	const { minimum, maximum } = AutoModerationRuleLimits.escalationDuration;
	return Math.min(maximum, Math.max(minimum, duration));
}

function normalizeEscalationAction(
	action: AutoModerationEscalationAction,
): AutoModerationEscalationAction {
	// `None` is no step, so a normalized step action is never one.
	return normalizeAutoModerationHardAction(action) as AutoModerationEscalationAction;
}

export function pickAutomodEscalationDefaults(
	draft: AutomodRuleDraft,
): AutomodEscalationDefaultFields {
	return {
		escalation: draft.escalation.map((step) => ({ ...step })),
		escalationDuration: escalationWindow(draft.escalationDuration),
	};
}

/**
 * A draft with the saved defaults laid over its type's own. Defaults saved
 * before `Timeout` was merged into `Mute` may still hold one: it is a `Mute`.
 */
export function applyAutomodRuleDefaults(
	draft: AutomodRuleDraft,
	defaults: AutomodRuleDefaults | undefined,
): AutomodRuleDraft {
	return {
		...draft,
		...(defaults?.rule && {
			...defaults.rule,
			hardAction: normalizeAutoModerationHardAction(defaults.rule.hardAction),
			ignoredChannels: [...defaults.rule.ignoredChannels],
			ignoredRoles: [...defaults.rule.ignoredRoles],
		}),
		...(defaults?.escalation && {
			escalation: defaults.escalation.escalation.map((step) => ({
				...step,
				action: normalizeEscalationAction(step.action),
			})),
			escalationDuration: escalationWindow(defaults.escalation.escalationDuration),
		}),
	};
}
