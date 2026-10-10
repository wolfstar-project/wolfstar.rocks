import type { AutomodRuleCreate } from "~/composables/useAutomodRules";
import {
	AutoModerationSoftActionBits,
	getDefaultAutoModerationRule,
	getDefaultAutoModerationRuleOptions,
	MaximumAutoModerationRuleNameLength,
	type AutoModerationHardAction,
	type AutoModerationRule,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";

export type AutomodRuleOptionValue = number | boolean | string[];

export interface AutomodEscalationDraft {
	action: AutoModerationHardAction;
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
		options: structuredClone(rule.options) as Record<string, AutomodRuleOptionValue>,
		escalation: rule.escalation.map((step) => ({
			action: step.action,
			duration: step.duration ?? 0,
		})),
		escalationDuration: rule.escalationDuration,
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

/** The options a draft takes when its type changes: the new type's defaults. */
export function defaultAutomodRuleOptions(
	type: AutoModerationRuleType,
): Record<string, AutomodRuleOptionValue> {
	return getDefaultAutoModerationRuleOptions(type) as Record<string, AutomodRuleOptionValue>;
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
