import {
	AutoModerationEscalationActions,
	AutoModerationHardActions,
	AutoModerationRuleLimits,
	MaximumAutoModerationRuleEscalationSteps,
	MaximumAutoModerationRuleListLength,
	MaximumAutoModerationRuleNameLength,
	MaximumAutoModerationRuleResponseLength,
	MaximumAutoModerationSoftAction,
	normalizeAutoModerationRuleEscalation,
	normalizeAutoModerationRuleOptions,
	type AutoModerationEscalationAction,
	type AutoModerationHardAction,
	type AutoModerationRuleData,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import { isSnowflake } from "#shared/utils/snowflake";
import { isObject } from "@sapphire/utilities";
import { remove as removeConfusables } from "confusables";

// Ported from `projects/bot/src/lib/moderation/automod/validation.ts` in the
// bot (wolfstar-project/wolfstar, V7). The bot's own API validates rule bodies
// with this, so a rule written here is one the bot would have accepted too.

/**
 * The most roles or channels a rule leaves alone.
 */
export const MaximumAutoModerationRuleIgnored = 100;

/**
 * A word as a `Words` rule stores it: lowercase and without look-alike characters, as the messages are matched.
 */
function normalizeAutoModerationRuleWord(word: string) {
	return removeConfusables(word.trim().toLowerCase());
}

/**
 * The bits a soft action is made of, see `AutoModerationOnInfraction`.
 */
const MaximumSoftAction = MaximumAutoModerationSoftAction;

export type AutoModerationRulePatch = Partial<Omit<AutoModerationRuleData, "type">>;

/**
 * Reads what a rule is created or edited with from data that is not trusted, the body of a request.
 *
 * @remarks Only the fields that are given are read, so the result is a patch. The options are read with
 * `normalizeAutoModerationRuleOptions`, on top of the current ones, so a request can give only the ones that change.
 * A `Timeout` is refused as a new value: it was merged into `Mute`, which is a timeout when the guild has
 * `moderationMuteTimeout` and its duration fits one. A rule saved with one is read as a `Mute` by the storage.
 *
 * @param type - The type of the rule, which its options depend on.
 * @param input - The data to read.
 * @param current - What the patch applies to: the options the rule has, when it exists.
 * @returns The patch, or what is wrong with the data, one message per field.
 */
export function parseAutoModerationRulePatch(
	type: AutoModerationRuleType,
	input: unknown,
	current: Partial<Pick<AutoModerationRuleData, "options">> = {},
): { data: AutoModerationRulePatch; errors?: undefined } | { data?: undefined; errors: string[] } {
	if (!isObject(input)) return { errors: ["Invalid body."] };
	const currentOptions: object = current.options ?? {};

	const body = input as Record<string, unknown>;
	const data: AutoModerationRulePatch = {};
	const errors: string[] = [];

	if (body.name !== undefined) {
		if (
			typeof body.name === "string" &&
			body.name.trim().length > 0 &&
			body.name.trim().length <= MaximumAutoModerationRuleNameLength
		) {
			data.name = body.name;
		} else {
			errors.push(
				`name: Expected a string of 1 to ${MaximumAutoModerationRuleNameLength} characters.`,
			);
		}
	}

	if (body.enabled !== undefined) {
		if (typeof body.enabled === "boolean") data.enabled = body.enabled;
		else errors.push("enabled: Expected a boolean.");
	}

	if (body.softAction !== undefined) {
		if (isInteger(body.softAction, 0, MaximumSoftAction)) data.softAction = body.softAction;
		else errors.push(`softAction: Expected an integer between 0 and ${MaximumSoftAction}.`);
	}

	if (body.hardAction !== undefined) {
		if (AutoModerationHardActions.includes(body.hardAction as AutoModerationHardAction)) {
			data.hardAction = body.hardAction as AutoModerationHardAction;
		} else {
			errors.push(`hardAction: Expected one of ${AutoModerationHardActions.join(", ")}.`);
		}
	}

	if (body.hardActionDuration !== undefined) {
		const { minimum, maximum } = AutoModerationRuleLimits.hardActionDuration;
		// Zero and `null` both make the hard action permanent:
		if (body.hardActionDuration === null || body.hardActionDuration === 0)
			data.hardActionDuration = null;
		else if (isInteger(body.hardActionDuration, minimum, maximum))
			data.hardActionDuration = body.hardActionDuration;
		else
			errors.push(
				`hardActionDuration: Expected null or an integer between ${minimum} and ${maximum}.`,
			);
	}

	for (const key of ["thresholdMaximum", "thresholdDuration"] as const) {
		const value = body[key];
		if (value === undefined) continue;

		const { minimum, maximum } = AutoModerationRuleLimits[key];
		if (isInteger(value, minimum, maximum)) data[key] = value;
		else errors.push(`${key}: Expected an integer between ${minimum} and ${maximum}.`);
	}

	for (const key of ["ignoredRoles", "ignoredChannels"] as const) {
		const value = body[key];
		if (value === undefined) continue;

		if (
			Array.isArray(value) &&
			value.length <= MaximumAutoModerationRuleIgnored &&
			value.every(isSnowflake)
		)
			data[key] = [...new Set(value)];
		else
			errors.push(
				`${key}: Expected an array of at most ${MaximumAutoModerationRuleIgnored} IDs.`,
			);
	}

	if (body.escalation !== undefined) {
		// The steps are checked before they are normalized, which would make a wrong duration a permanent punishment:
		if (
			Array.isArray(body.escalation) &&
			body.escalation.length <= MaximumAutoModerationRuleEscalationSteps &&
			body.escalation.every((step) => isEscalationStep(step))
		) {
			data.escalation = normalizeAutoModerationRuleEscalation(body.escalation);
		} else {
			const { maximum } = AutoModerationRuleLimits.hardActionDuration;
			errors.push(
				`escalation: Expected an array of at most ${MaximumAutoModerationRuleEscalationSteps} steps, each an action (${AutoModerationEscalationActions.join(", ")}) and a duration: null, or an integer between 1 and ${maximum}.`,
			);
		}
	}

	if (body.escalationDuration !== undefined) {
		const { minimum, maximum } = AutoModerationRuleLimits.escalationDuration;
		if (isInteger(body.escalationDuration, minimum, maximum))
			data.escalationDuration = body.escalationDuration;
		else
			errors.push(
				`escalationDuration: Expected an integer between ${minimum} and ${maximum}.`,
			);
	}

	if (body.response !== undefined) {
		// An empty response is none, the alert says the line of the type:
		if (
			body.response === null ||
			(typeof body.response === "string" && body.response.trim().length === 0)
		)
			data.response = null;
		else if (
			typeof body.response === "string" &&
			body.response.trim().length <= MaximumAutoModerationRuleResponseLength
		)
			data.response = body.response.trim();
		else
			errors.push(
				`response: Expected null or a string of at most ${MaximumAutoModerationRuleResponseLength} characters.`,
			);
	}

	// Whether the bot can post in the channel is checked by the route, which asks Discord:
	if (body.logChannelId !== undefined) {
		if (body.logChannelId === null || isSnowflake(body.logChannelId))
			data.logChannelId = body.logChannelId;
		else errors.push("logChannelId: Expected null or an ID.");
	}

	if (body.options !== undefined) {
		if (isObject(body.options)) {
			const options = { ...currentOptions, ...body.options } as Record<string, unknown>;
			if (type === "Words" && Array.isArray(options.words)) {
				options.words = options.words.map((word) =>
					typeof word === "string" ? normalizeAutoModerationRuleWord(word) : word,
				);
			}
			const normalized = normalizeAutoModerationRuleOptions(type, options);
			// A list longer than the cap that the rule already had is kept, but it cannot grow:
			const current = currentOptions as Record<string, unknown>;
			for (const [key, value] of Object.entries(normalized)) {
				if (!Array.isArray(value) || value.length <= MaximumAutoModerationRuleListLength)
					continue;
				const previous = Array.isArray(current[key]) ? current[key].length : 0;
				if (value.length > previous) {
					errors.push(
						`options.${key}: Expected at most ${MaximumAutoModerationRuleListLength} entries.`,
					);
				}
			}

			data.options = normalized;
		} else {
			errors.push("options: Expected an object.");
		}
	}

	return errors.length === 0 ? { data } : { errors };
}

/**
 * Whether a value is a step of an escalation as a request must write it: a hard action, and a duration that is `null`
 * (or left out) for a permanent one or a positive integer within the limits.
 */
function isEscalationStep(value: unknown): boolean {
	if (!isObject(value)) return false;

	const { action, duration } = value as { action?: unknown; duration?: unknown };
	if (!AutoModerationEscalationActions.includes(action as AutoModerationEscalationAction))
		return false;
	if (duration === null || duration === undefined) return true;
	return isInteger(duration, 1, AutoModerationRuleLimits.hardActionDuration.maximum);
}

function isInteger(value: unknown, minimum: number, maximum: number): value is number {
	return (
		typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
	);
}
